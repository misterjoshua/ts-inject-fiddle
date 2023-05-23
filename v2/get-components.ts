import tsm from 'ts-morph';
import path from 'path';
import url from 'url';

const API_PATH = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'di.ts');

export type Components = ClassDeclarationInfo[];

type ClassDeclarationDependencyPrototype<T extends string, N extends tsm.Node> = {
  type: T,
  node: N,
};

export type DependencyInfo =
  | ClassDeclarationDependencyPrototype<'class', tsm.ClassDeclaration>
  | ClassDeclarationDependencyPrototype<'interface', tsm.InterfaceDeclaration>;

export type FactoryInfo = {
  method: tsm.MethodDeclaration;
  returnType: tsm.ClassDeclaration | tsm.InterfaceDeclaration;
}

export interface ClassDeclarationInfo {
  class: tsm.ClassDeclaration;
  name?: string;
  order: number;
  qualifiers: string[];
  constructorDependencies: Record<string, DependencyInfo>;
  factories: FactoryInfo[];
  inherits: tsm.ClassDeclaration[];
  implements: tsm.InterfaceDeclaration[];
}

export function getComponents(...globs: string[]): Components {
  const project = new tsm.Project();

  project.addSourceFilesAtPaths(API_PATH);
  const apiFile = project.getSourceFile(
    API_PATH,
  )!;

  for (const glob of globs) {
    project.addSourceFilesAtPaths(glob);
  }

  // Create a map of class declaration information.
  const components = new Array<
    ClassDeclarationInfo
  >();

  for (const clazz of findStereotypeReferences(getStereotype('Component'))) {
    const graphNode: ClassDeclarationInfo = {
      class: clazz,
      order: 0,
      qualifiers: [],
      constructorDependencies: {},
      factories: [],
      inherits: [],
      implements: [],
    };

    let currentClass: tsm.ClassDeclaration | undefined = clazz;
    while (currentClass !== undefined) {
      populateClassDeclarationInfo(currentClass, graphNode);
      currentClass = currentClass.getBaseClass();
    }

    components.push(graphNode);
  }

  return components;

  function getStereotype(
    name: string,
  ): tsm.FunctionDeclaration {
    const [exported] = apiFile.getExportedDeclarations().get(name)!;
    return exported.asKind(tsm.SyntaxKind.FunctionDeclaration)!;
  }

  function findStereotypeReferences(
    functionDeclaration: tsm.FunctionDeclaration,
  ): tsm.ClassDeclaration[] {
    const references = functionDeclaration.findReferencesAsNodes();

    return references.flatMap((ref) => {
      const decorator = ref.getParentIfKind(tsm.SyntaxKind.Decorator);
      if (!decorator) return [];

      const clazz = decorator.getParentIfKind(tsm.SyntaxKind.ClassDeclaration);
      if (!clazz) return [];

      return [clazz];
    });
  }

  function populateClassDeclarationInfo(
    currentClass: tsm.ClassDeclaration,
    graphNode: ClassDeclarationInfo,
  ) {
    const orderStereotype = getStereotype('Order');
    const qualifierStereotype = getStereotype('Qualifier');
    const nameStereotype = getStereotype('Name');
    const factoryStereotype = getStereotype('Factory');

    for (const heritageClause of currentClass.getHeritageClauses() ?? []) {
      if (heritageClause.getToken() == tsm.SyntaxKind.ExtendsKeyword) {
        // Inherited classes
        for (const heritageIdentifier of heritageClause.getDescendantsOfKind(
          tsm.SyntaxKind.Identifier,
        )) {
          const [definition] = heritageIdentifier.getDefinitionNodes();
          if (definition.isKind(tsm.SyntaxKind.ClassDeclaration)) {
            graphNode.inherits.push(definition);
          }
        }
      } else if (heritageClause.getToken() == tsm.SyntaxKind.ImplementsKeyword) {
        // Implemented interfaces
        for (const heritageIdentifier of heritageClause.getDescendantsOfKind(
          tsm.SyntaxKind.Identifier,
        )) {
          const [definition] = heritageIdentifier.getDefinitionNodes();
          if (definition.isKind(tsm.SyntaxKind.InterfaceDeclaration)) {
            graphNode.implements.push(definition);
          }
        }
      }
    }

    // Collect dependencies
    const [constructor] = currentClass.getConstructors();
    if (constructor) {
      for (const parameter of constructor.getParameters()) {
        const { dependency, dependencyName } = describeParameterDependency(parameter);
        graphNode.constructorDependencies[dependencyName] = dependency;
      }
    }

    // Collect factory methods
    for (const method of currentClass.getMethods()) {
      const methodDecorators = method.getDecorators();
      if (methodDecorators.some((d) => d.getFirstDescendantByKindOrThrow(tsm.SyntaxKind.Identifier).getDefinitionNodes().includes(factoryStereotype))) {
        graphNode.factories.push(describeFactory(method));
      }
    }

    // Track metadata decorators
    for (const decorator of currentClass.getChildrenOfKind(
      tsm.SyntaxKind.Decorator,
    )) {
      const decoratorIdentifier = decorator.getFirstDescendantByKindOrThrow(
        tsm.SyntaxKind.Identifier,
      );
      const [decoratorDefinition] = decoratorIdentifier.getDefinitionNodes();

      const decoratorArguments = decorator.getArguments();

      if (decoratorDefinition == orderStereotype) {
        graphNode.order = decoratorArguments[0].asKindOrThrow(tsm.SyntaxKind.NumericLiteral).getLiteralValue();
      } else if (decoratorDefinition == qualifierStereotype) {
        graphNode.qualifiers.push(decoratorArguments[0].asKindOrThrow(tsm.SyntaxKind.StringLiteral).getLiteralValue());
      } else if (decoratorDefinition == nameStereotype) {
        graphNode.name = decoratorArguments[0].asKindOrThrow(tsm.SyntaxKind.StringLiteral).getLiteralValue();
      } else {
        // ... other stereotypes
      }
    }
  }
}

function describeParameterDependency(parameter: tsm.ParameterDeclaration): {
  dependency: DependencyInfo,
  dependencyName: string
} {
  const identifier = parameter.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
  const typeReference = parameter.getFirstChildByKindOrThrow(tsm.SyntaxKind.TypeReference);
  const typeIdentifier = typeReference.getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier);
  const [typeDefinition] = typeIdentifier.getDefinitionNodes();
  if (!typeDefinition) throw new Error('Could not find type definition for ' + typeIdentifier.getText());

  const dependencyName = identifier.getText();

  if (typeDefinition.isKind(tsm.SyntaxKind.InterfaceDeclaration)) {
    return {
      dependencyName,
      dependency: {
        type: 'interface',
        node: typeDefinition,
      },
    };
  } else if (typeDefinition.isKind(tsm.SyntaxKind.ClassDeclaration)) {
    return {
      dependencyName,
      dependency: {
        type: 'class',
        node: typeDefinition,
      },
    };
  }

  throw new Error('Unknown type definition kind: ' + typeDefinition.getKindName());
}

function describeFactory(method: tsm.MethodDeclaration): FactoryInfo {
  const returnType = method.getReturnTypeNodeOrThrow().getFirstChildByKindOrThrow(tsm.SyntaxKind.Identifier).getDefinitionNodes()[0];
  if (!returnType.isKind(tsm.SyntaxKind.InterfaceDeclaration) && !returnType.isKind(tsm.SyntaxKind.ClassDeclaration)) {
    throw new Error('Unsupported return type definition kind: ' + returnType.getKindName());
  }

  return {
    method,
    returnType,
  };
}

export function summarize(components: Components) {
  // Output a summary of the component declaration map:
  console.log('Component declaration map:');

  for (const info of components) {
    console.log(`  ${info.class.getName()}:`);
    console.log(`    Name: ${info.name ?? '<<none>>'}`);
    console.log(`    Order: ${info.order}`);
    console.log(`    Qualifiers: ${info.qualifiers.length > 0 ? info.qualifiers.join(', ') : '<<none>>'}`);
    console.log(`    Factories: ${info.factories.length > 0 ? info.factories.map(f => f.method.getName()).join(', ') : '<<none>>'}`);
    console.log(
      `    Inherits: ${info.inherits.length > 0 ? info.inherits.map((c) => c.getName()).join(', ') : '<<none>>'}`,
    );
    console.log(
      `    Implements: ${info.implements.length > 0 ? info.implements.map((c) => c.getName()).join(', ') : '<<none>>'}`,
    );
  }
}

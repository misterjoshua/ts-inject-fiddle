import tsm from "ts-morph";
import path from "path";
import url from "url";

const project = new tsm.Project();

const basePath = path.dirname(url.fileURLToPath(import.meta.url));
project.addSourceFilesAtPaths(path.join(basePath, "example/**/*.ts"));

const diSourceFile = project.getSourceFile(
  path.join(basePath, "example/di.ts")
)!;

const componentStereotype = getStereotype(diSourceFile, "Component");
const orderStereotype = getStereotype(diSourceFile, "Order");
const tagStereotype = getStereotype(diSourceFile, "Tag");

type ClassDeclarationInfo = {
  order: number;
  tags: string[];
  inherits: tsm.ClassDeclaration[];
  implements: tsm.InterfaceDeclaration[];
};

// Create a map of class declaration information.
const componentDeclarationMap = new Map<
  tsm.ClassDeclaration,
  ClassDeclarationInfo
>();

for (const ref of findStereotypeReferences(componentStereotype)) {
  const graphNode: ClassDeclarationInfo = {
    order: 0,
    tags: [],
    inherits: [],
    implements: [],
  };

  let currentClass: tsm.ClassDeclaration | undefined = ref.class;
  while (currentClass !== undefined) {
    populateClassDeclarationInfo(currentClass, graphNode);
    currentClass = currentClass.getBaseClass();
  }

  componentDeclarationMap.set(ref.class, graphNode);
}

// Output a summary of the component declaration map:
console.log("Component declaration map:");

for (const [clazz, info] of componentDeclarationMap) {
  console.log(`  ${clazz.getName()}:`);
  console.log(`    Order: ${info.order}`);
  console.log(`    Tags: ${info.tags.join(", ")}`);
  console.log(
    `    Inherits: ${info.inherits.map((c) => c.getName()).join(", ")}`
  );
  console.log(
    `    Implements: ${info.implements.map((c) => c.getName()).join(", ")}`
  );
}

// TODO: For every component, find now we can construct them.



// const outPath = path.join(basePath, "generated.ts");
// const outputSourceFile = project.createSourceFile(outPath, "", {
//   overwrite: true,
// });

// outputSourceFile.formatText();
// outputSourceFile.saveSync();

process.exit(0);

/// Helper functions follow

function getStereotype(
  source: tsm.SourceFile,
  name: string
): tsm.FunctionDeclaration {
  const [exported] = source.getExportedDeclarations().get(name)!;
  return exported.asKind(tsm.SyntaxKind.FunctionDeclaration)!;
}

function findStereotypeReferences(
  functionDeclaration: tsm.FunctionDeclaration
): { decorator: tsm.Decorator; class: tsm.ClassDeclaration }[] {
  const references = functionDeclaration.findReferencesAsNodes();

  return references.flatMap((ref) => {
    const decorator = ref.getParentIfKind(tsm.SyntaxKind.Decorator);
    if (!decorator) return [];

    const clazz = decorator.getParentIfKind(tsm.SyntaxKind.ClassDeclaration);
    if (!clazz) return [];

    return [
      {
        decorator,
        class: clazz,
      },
    ];
  });
}

function populateClassDeclarationInfo(
  currentClass: tsm.ClassDeclaration,
  graphNode: ClassDeclarationInfo
) {
  for (const heritageClause of currentClass.getHeritageClauses() ?? []) {
    if (heritageClause.getToken() == tsm.SyntaxKind.ExtendsKeyword) {
      // Inherited classes
      for (const heritageIdentifier of heritageClause.getDescendantsOfKind(
        tsm.SyntaxKind.Identifier
      )) {
        const [definition] = heritageIdentifier.getDefinitionNodes();
        if (definition.isKind(tsm.SyntaxKind.ClassDeclaration)) {
          graphNode.inherits.push(definition);
        }
      }
    } else if (heritageClause.getToken() == tsm.SyntaxKind.ImplementsKeyword) {
      // Implemented interfaces
      for (const heritageIdentifier of heritageClause.getDescendantsOfKind(
        tsm.SyntaxKind.Identifier
      )) {
        const [definition] = heritageIdentifier.getDefinitionNodes();
        if (definition.isKind(tsm.SyntaxKind.InterfaceDeclaration)) {
          graphNode.implements.push(definition);
        }
      }
    }
  }

  // Track metadata decorators
  for (const decorator of currentClass.getChildrenOfKind(
    tsm.SyntaxKind.Decorator
  )) {
    const decoratorIdentifier = decorator.getFirstDescendantByKindOrThrow(
      tsm.SyntaxKind.Identifier
    );
    const [decoratorDefinition] = decoratorIdentifier.getDefinitionNodes();

    const decoratorArguments = decorator.getArguments();
    const fileLine = `${currentClass
      .getSourceFile()
      .getFilePath()}:${currentClass.getStartLineNumber()}`;

    if (decoratorDefinition == orderStereotype) {
      graphNode.order = parseInt(decoratorArguments[0].getText());
    } else if (decoratorDefinition == tagStereotype) {
      graphNode.tags.push(decoratorArguments[0].getText());
    } else {
      // ... other stereotypes
    }
  }
}

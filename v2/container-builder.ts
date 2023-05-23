import { ClassDeclarationInfo, Components, summarize } from './get-components.js';
import tsm from 'ts-morph';
import { createHash } from 'crypto';

export class ContainerBuilder {
  private readonly components: Components;

  constructor(components: Components, private readonly containerFile: tsm.SourceFile) {
    this.components = [...components].sort((a, b) => {
      const aDependsOnB = dependsOn(a, b);
      const bDependsOnA = dependsOn(b, a);
      if (aDependsOnB && bDependsOnA) throw new Error(`Circular dependency between ${a.class.getName()} and ${b.class.getName()}`);
      if (aDependsOnB) return 1;
      else if (bDependsOnA) return -1;
      return 0;
    });
  }

  build() {
    this.containerFile.addStatements('// GENERATED FILE - DO NOT EDIT');

    const selectedComponents = this.selectComponents();

    for (const component of selectedComponents) {
      const alias = getClassAlias(component);
      const moduleSpecifier = './' + this.containerFile.getRelativePathTo(component.class.getSourceFile().getFilePath()).replace(/.ts$/, '.js');
      this.containerFile.addImportDeclaration({
        namedImports: [{
          name: component.class.getName()!,
          alias,
        }],
        moduleSpecifier,
      });

      const [constructor] = component.class.getConstructors();
      if (!constructor || constructor.getParameters().length === 0) {
        this.containerFile.addStatements(`new ${alias}();`);
      }
    }
  }

  /**
   * Select which components to create.
   */
  private selectComponents() {
    return this.components;
  }
}

function dependsOn(a: ClassDeclarationInfo, b: ClassDeclarationInfo): boolean {
  for (const dependency of Object.values(a.constructorDependencies)) {
    switch (dependency.type) {
      case 'class':
        if (dependency.node === b.class) return true;
        if (b.inherits.includes(dependency.node)) return true;
        if (b.factories.some(f => dependency.node === f.returnType)) return true;
        break;
      case 'interface':
        if (b.implements.includes(dependency.node)) return true;
        if (b.factories.some(f => dependency.node === f.returnType)) return true;
        break;
      default:
        throw new Error(`Unknown dependency type`);
    }
  }

  return false;
}

function getClassAlias(component: ClassDeclarationInfo): string {
  const sfx = createHash('sha256').update(component.class.getSourceFile().getFilePath()).digest('hex').substring(0, 8);
  return `${component.class.getName()}_${sfx}`;
}

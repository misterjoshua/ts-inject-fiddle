import { ClassDeclarationInfo, Components } from './get-components.js';
import tsm from 'ts-morph';
import { createHash } from 'crypto';

export class ContainerBuilder {
  constructor(private readonly components: Components, private readonly containerFile: tsm.SourceFile) {
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

function getClassAlias(component: ClassDeclarationInfo): string {
  const sfx = createHash('sha256').update(component.class.getSourceFile().getFilePath()).digest('hex').substring(0, 8);
  return `${component.class.getName()}_${sfx}`;
}

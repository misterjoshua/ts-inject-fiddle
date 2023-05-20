import { createHash } from 'crypto';
import { Project, SourceFile, VariableDeclaration } from 'ts-morph';
import { SyntaxKind } from 'typescript';

// https://ts-ast-viewer.com/#code/KYDwDg9gTgLgBASwHY2FAZgQwMbDgYQBtMBnEhdBNOAbwCg44phMATCJQgTzhi7GAAuOCRhRkAcwDcdAL506oSLDjZiZOADkOeBAFswhYHuAoSBdeUrV6jZmw7de-PAF44AIiQ6PM+YvBoeDVScwAVTAlEAyMTMwtQiiooWgYmFnZOHj4BOHcPGEjfNOwOUSgAV2wYaAAKMAqAI0IEbHSHLN5I4XLJAEpaeX8lINVLOAB5KFZqfUNjUxhzIkTrFNt2zKcct09oGahixlKkcqqaqHqmlrb7LZ59tGEkCr1GtAGaIYURlRCNfAQN7IYCsaLzOJLBJkJI2NJ3RzZFx5TylYFIUFHVRlMTnOoNZqtTaIsarZIkYQrGFrADaAF1Pt8Aspgji4BJgDAqVZkiiAMpcN4QQi1DzIABWwGqmGawA8fRkzNGyFQGBweAA4pzubD1mkaRyuZZdXTan1Kca1n4foE-uMAGIQCAARlSjFEmBgRIN2styVN5uhPLhjDsnIqUCQcAxAHc4BEJKL0E7nfKZIwmb9gg6nQAmN0iQpeto+o1ktABi3lvWh9IwCNR2PxyJJvNptKZ23Z0JwR0QADMBY9xbgpZ1a0rQd1BbD9cj0eAcYTrYH7YzchtLNJGj7ABYh0WiYbx8kzVXqbyNrOGwuly2PMmILu13AhkA

const project = new Project();

// Add the example directory to the project
const sourceFiles = project.addSourceFilesAtPaths('example/**/*.ts');
const getClassifierVariable = findGetClassifierVariable(sourceFiles);
const getClassifierStaticFunctions = findClassesImplementingStaticVariableFn(getClassifierVariable);

const outPath = './generated.ts';
const outputSourceFile = project.createSourceFile(outPath, '', { overwrite: true });

outputSourceFile.addImportDeclaration({
  namedImports: ['getClassifier'],
  moduleSpecifier: './example/Classifier',
});

for (const classDeclaration of getClassifierStaticFunctions) {
  // Now create an import for each class and run it
  const moduleSpecifier = `./${outputSourceFile.getRelativePathTo(classDeclaration.getSourceFile()).replace(/\.ts$/, '')}`;
  const hash = createHash('sha256').update(moduleSpecifier).digest('hex').slice(0, 6);
  const alias = `${classDeclaration.getName()!}_${hash}`;
  
  outputSourceFile.addImportDeclaration({
    namedImports: [{
      name: classDeclaration.getName()!,
      alias,
    }],
    moduleSpecifier: moduleSpecifier,
  });

  outputSourceFile.addStatements([
    `console.log(${alias}[getClassifier]());`,
  ]);
}

outputSourceFile.formatText();
outputSourceFile.saveSync();
console.log(`Generated file: ${outPath}`);

function findClassesImplementingStaticVariableFn(variable: VariableDeclaration) {
  return variable.findReferencesAsNodes().flatMap(ref => {
    const memberFunctionDeclaration = ref.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
    const staticKeyword = memberFunctionDeclaration?.getFirstDescendantByKind(SyntaxKind.StaticKeyword);
    const classDeclaration = staticKeyword?.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
    return classDeclaration ? [classDeclaration] : [];
  });
}

function findGetClassifierVariable(sourceFiles: SourceFile[]): VariableDeclaration {
  for (const sourceFile of sourceFiles) {
    if (sourceFile.getBaseName() !== 'Classifier.ts') continue;
    const exported = sourceFile.getExportedDeclarations();
    const [getClassifierExport] = exported.get('getClassifier') ?? [];
    const asKind = getClassifierExport.asKind(SyntaxKind.VariableDeclaration);
    if (!asKind) continue;
    return asKind;
  }
  throw new Error('Could not find getClassifier symbol');
}
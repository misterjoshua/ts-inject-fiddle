import { describe, test, expect } from 'vitest';
import { getComponents } from './get-components.js';
import path from 'path';
import url from 'url';
import { ContainerBuilder } from './container-builder.js';
import tsm from 'ts-morph';

const basePath = path.dirname(url.fileURLToPath(import.meta.url));

describe('simple', () => {
  test('build', () => {
    const components = getComponents(
      path.join(basePath, 'example/dependency.ts'),
    );

    const project = new tsm.Project();
    const container = project.createSourceFile(
      path.join(basePath, '__container.ts'),
      '',
      { overwrite: true },
    );

    const builder = new ContainerBuilder(components, container);
    builder.build();

    container.formatText();
    container.saveSync();
  });
});

import { describe, expect, test } from 'vitest';
import { getComponents, summarize } from './get-components.js';
import path from 'path';
import url from 'url';

// https://ts-ast-viewer.com/

const basePath = path.dirname(url.fileURLToPath(import.meta.url));

describe('simple', () => {
  const components = getComponents(path.join(basePath, 'example/simple.ts'));
  summarize(components);

  test('has a named component', () => {
    expect(components.some(c => c.name === 'MyComponent')).toEqual(true);
  });
});

describe('dependency', () => {
  const components = getComponents(path.join(basePath, 'example/dependency.ts'));
  summarize(components);

  test('has a named component', () => {
    expect(components.some(c => c.name === 'MyComponent')).toEqual(true);
  });

  test('has two components', () => {
    expect(components.map(c => c.class.getName()))
      .toEqual(expect.arrayContaining([
        'Dependency',
        'MyComponent',
      ]));
  });
});

describe('factory', () => {
  const components = getComponents(path.join(basePath, 'example/factory.ts'));
  summarize(components);

  test('has a named component', () => {
    expect(components.some(c => c.name === 'MyComponent')).toEqual(true);
  });

  test('has the critical components', () => {
    expect(components.map(c => c.class.getName()))
      .toEqual(expect.arrayContaining([
        'DependencyFactory',
        'MyComponent',
      ]));
  });

  test('has the factory', () => {
    const factoryClasses = components
      .filter(c => c.factories.length > 0)
      .map(c => c.class.getName());

    expect(factoryClasses).toEqual(['DependencyFactory']);
  });
});

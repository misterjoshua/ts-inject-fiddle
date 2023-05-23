import { Component, Factory, Inject, Name } from '../di.js';

@Component
@Name('MyComponent')
export class MyComponent {
  constructor(public readonly dependency: Inject<Dependency>) {
    console.log('MyComponent.constructor dependency.value=', dependency.value);
  }
}

export class Dependency {
  constructor(public readonly value: string) {
    console.log('Dependency.constructor value=', value);
  }
}

/**
 * This factory will be newed up to create the dependency used by MyComponent.
 */
@Component
export class DependencyFactory {
  constructor() {
    console.log('DependencyFactory.constructor');
  }

  @Factory
  create(): Dependency {
    return new Dependency('DependencyFactory');
  }
}

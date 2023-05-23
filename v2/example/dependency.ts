import { Component, Inject, Name } from '../di.js';

@Component
@Name('MyComponent')
export class MyComponent {
  constructor(public readonly dependency: Inject<Dependency>) {
  }
}

@Component
export class Dependency {
}

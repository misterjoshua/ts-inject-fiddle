import { Component, Name } from '../di.js';

@Component
@Name('MyComponent')
export class MyComponent {
  constructor(public readonly dependency: Dependency) {
  }
}

@Component
export class Dependency {
}

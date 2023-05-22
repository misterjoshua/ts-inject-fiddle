import { Component, Name } from '../di.js';

@Component
@Name('simple')
export class SimpleConstruction {
  doSomething(): void {
    console.log('Simple');
  }
}
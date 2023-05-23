import { Component, Inject, Name } from '../di.js';

export interface Collectable {
  messagePart(): string;
}

@Component
@Name('Collector')
export class Collector {
  constructor(collectables: Inject<Collectable[]>) {
    console.log('Collector.constructor collectables=', collectables);
    console.log('parts=', collectables.map(collectable => collectable.messagePart()).join(' '));
  }
}

@Component
class Hello implements Collectable {
  constructor() {
    console.log('Hello.constructor');
  }

  messagePart() {
    return 'Hello';
  }
}

@Component
class World implements Collectable {
  constructor() {
    console.log('World.constructor');
  }

  messagePart() {
    return 'World';
  }
}

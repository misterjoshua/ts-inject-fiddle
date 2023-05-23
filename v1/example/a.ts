import {
  getClassifier as aliasedGetClassifier,
  Classifier,
  Tag,
  falseGetClassifier,
} from './Classifier.js';

export class Foo1 {
  static [aliasedGetClassifier](): Classifier {
    return new Tag('foo1');
  }
}

export class Foo2 {
  static [aliasedGetClassifier](): Classifier {
    return new Tag('foo2');
  }
}

export class Foo3 {
  static [aliasedGetClassifier](): Classifier {
    return new Tag('foo3');
  }
}

export class Bad1 {
  static getClassifier(): Classifier {
    return new Tag('foo4');
  }
}

export class Bad2 {
  static [falseGetClassifier](): Classifier {
    return new Tag('foo4');
  }
}

export class Bad3 {
  [aliasedGetClassifier]() {
    return new Tag('foo4');
  }
}

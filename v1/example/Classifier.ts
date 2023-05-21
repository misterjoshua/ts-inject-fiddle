export interface Classifier {
  readonly type: string;
}

export class None implements Classifier {
  readonly type = "none";
}

export class Tag implements Classifier {
  readonly type = "tag";
  constructor(public readonly tag: string) {}
}

export class Order implements Classifier {
  readonly type = "order";
  constructor(public readonly order: number) {}
}

export class Combined implements Classifier {
  readonly type = "combined";
  constructor(public readonly classifiers: Classifier[]) {}
}

export const getClassifier = Symbol("injectable");

export const falseGetClassifier = Symbol('bad');

export interface GetClassifier {
  [getClassifier](): Classifier;
}

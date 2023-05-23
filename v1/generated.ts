import { getClassifier } from './example/Classifier.js';
import { Foo1 as Foo1_ffd8c1 } from './example/a.js';
import { Foo2 as Foo2_ffd8c1 } from './example/a.js';
import { Foo3 as Foo3_ffd8c1 } from './example/a.js';
import { Foo1 as Foo1_788ea5 } from './example/b.js';
import { Foo2 as Foo2_788ea5 } from './example/b.js';
import { Foo3 as Foo3_788ea5 } from './example/b.js';

console.log(Foo1_ffd8c1[getClassifier]());
console.log(Foo2_ffd8c1[getClassifier]());
console.log(Foo3_ffd8c1[getClassifier]());
console.log(Foo1_788ea5[getClassifier]());
console.log(Foo2_788ea5[getClassifier]());
console.log(Foo3_788ea5[getClassifier]());

import { getClassifier } from "./example/Classifier";
import { Foo1 as Foo1_a86b16 } from "./example/a";
import { Foo2 as Foo2_a86b16 } from "./example/a";
import { Foo3 as Foo3_a86b16 } from "./example/a";
import { Foo1 as Foo1_e00653 } from "./example/b";
import { Foo2 as Foo2_e00653 } from "./example/b";
import { Foo3 as Foo3_e00653 } from "./example/b";

console.log(Foo1_a86b16[getClassifier]());
console.log(Foo2_a86b16[getClassifier]());
console.log(Foo3_a86b16[getClassifier]());
console.log(Foo1_e00653[getClassifier]());
console.log(Foo2_e00653[getClassifier]());
console.log(Foo3_e00653[getClassifier]());

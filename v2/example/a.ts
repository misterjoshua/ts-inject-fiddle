import { Component, Order, Tag } from "./di.js";

export interface FooIntf1 {
  foo1(): void;
}

export interface FooIntf2 {
  foo2(): void;
}

export interface FooBase2Intf {
  fooBase(): void;
}

export abstract class FooBaseABC {}

export class FooBase1 extends FooBaseABC {}
export class FooBase2 extends FooBase1 implements FooBase2Intf {
  fooBase(): void {
    console.log("fooBase");
  }
}

@Component
@Order(1)
@Tag("foo")
@Tag("bar")
export class Foo1 extends FooBase2 implements FooIntf1, FooIntf2 {
  foo1() {
    console.log("foo");
  }

  foo2(): void {
    console.log("foo2");
  }
}

@Component
export class Foo2 {
  constructor(private foo1: Foo1[]) {}
}

export class Bad1 {}

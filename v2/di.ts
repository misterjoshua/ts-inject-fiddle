/**
 * Provide decorators and types to support dependency injection.
 */

export function Component<T extends { new (...args: any[]): {} }>(
  constructor: T,
  _context: ClassDecoratorContext,
) {
  return constructor;
}

export function Order(order: number) {
  return <T extends { new (...args: any[]): {} }>(
    constructor: T,
    _context: ClassDecoratorContext,
  ) => constructor;
}

export function Qualifier(tag: string) {
  return <T extends { new (...args: any[]): {} }>(
    constructor: T,
    _context: ClassDecoratorContext,
  ) => constructor;
}

export function Name(name: string) {
  return <T extends { new (...args: any[]): {} }>(
    constructor: T,
    _context: ClassDecoratorContext,
  ) => constructor;
}

export function Factory(
  originalMethod: any,
  _context: ClassMethodDecoratorContext,
) {
  return originalMethod;
}

export type Inject<T> = T;

export function Component<T extends { new(...args: any[]): {} }>(constructor: T) {
  return constructor;
}

export function Order(order: number) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => constructor;
}

export function Tag(tag: string) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => constructor;
}

export function Name(name: string) {
  return <T extends { new(...args: any[]): {} }>(constructor: T) => constructor;
}

export type Injectable<T> = T;

export function Component<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {};
}

export function Order(order: number) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      order = order;
    };
  };
}

export function Tag(tag: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      tag = tag;
    };
  };
}

import { test, expect } from 'vitest';
import { doThing } from './do-thing.js';
import path from 'path';
import url from 'url';

test('asdf', () => {
  const basePath = path.dirname(url.fileURLToPath(import.meta.url));
  doThing(basePath);
});
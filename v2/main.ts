import path from "path";
import url from "url";
import {doThing} from "./do-thing.js";

const basePath = path.dirname(url.fileURLToPath(import.meta.url));

doThing([path.join(basePath, 'example', 'various-components.ts')]);

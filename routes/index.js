import { readFileSync } from 'node:fs';

let rawdata = readFileSync(new URL('./routes.json', import.meta.url));
let routes = JSON.parse(rawdata);

export { routes };
import { readFileSync } from 'node:fs';

let rawdata = readFileSync(new URL('./config.json', import.meta.url));
let config = JSON.parse(rawdata);

export { config };
import { readFileSync, writeFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const filePath = 'src/SkribbyClient.ts';
const source = readFileSync(filePath, 'utf8');
const pattern = /const SKRIBBY_CLIENT_VERSION = '[^']+';/;

if (!pattern.test(source)) {
  throw new Error('Could not find SKRIBBY_CLIENT_VERSION');
}

const next = source.replace(
  pattern,
  `const SKRIBBY_CLIENT_VERSION = '${packageJson.version}';`,
);

writeFileSync(filePath, next);

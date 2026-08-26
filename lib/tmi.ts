import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type TmiItem = {
  text: string;
  urls: string[];
};

const blockSeparator = /^[\t ]*---[\t ]*$/m;
const urlPattern = /https?:\/\/[^\s<>"']+/gu;

export function parseTmiText(input: string): TmiItem[] {
  return input
    .split(blockSeparator)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const urls: string[] = [];
      const text = block
        .split(/\r?\n/)
        .map((line) =>
          line
            .replace(urlPattern, (url) => {
              urls.push(url);
              return '';
            })
            .trimEnd(),
        )
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return { text, urls };
    })
    .filter((item) => item.text || item.urls.length > 0);
}

export function getTmiItems(): TmiItem[] {
  const filePath = join(process.cwd(), 'data', 'tmi.txt');
  return parseTmiText(readFileSync(filePath, 'utf8'));
}

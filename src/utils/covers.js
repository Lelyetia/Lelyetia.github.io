import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Add cover images here; the gallery is generated again with every site build.
export const coverDirectory = 'public/images/covers';
const preferredDefault = '/images/covers/minecraft-castle.jpg';

export function getCovers() {
  const covers = readdirSync(resolve(process.cwd(), coverDirectory), { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('.') && /\.(jpe?g|png|webp|avif)$/i.test(file.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
    .map(file => ({
      src: `/images/covers/${encodeURIComponent(file.name)}`,
      title: file.name === 'minecraft-castle.jpg' ? '暮色城堡' : file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
    }));
  if (!covers.length) throw new Error(`Please keep at least one cover image in ${coverDirectory}.`);
  return covers;
}

export function getDefaultCover(covers) {
  return covers.find(cover => cover.src === preferredDefault) ?? covers[0];
}

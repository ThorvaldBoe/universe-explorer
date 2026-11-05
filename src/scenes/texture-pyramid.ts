import * as THREE from 'three';

export interface TextureTile {
  x: number;
  y: number;
  columns: number;
  rows: number;
  texture: THREE.CanvasTexture;
}

export interface TexturePyramidLevel {
  level: number;
  columns: number;
  rows: number;
  tiles: TextureTile[];
}

/**
 * Build a Deep Zoom pyramid from one canonical canvas. Every level is a
 * deterministic downsample of that source, and each tile carries a two-pixel
 * gutter copied from its neighbours so linear filtering cannot expose seams.
 */
export function createTexturePyramid(master: HTMLCanvasElement, tileSize = 256, gutter = 2): TexturePyramidLevel[] {
  const levels: TexturePyramidLevel[] = [];
  let source = master;
  let level = 0;

  while (true) {
    const columns = Math.ceil(source.width / tileSize);
    const rows = Math.ceil(source.height / tileSize);
    const tiles: TextureTile[] = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const sourceX = x * tileSize;
        const sourceY = y * tileSize;
        const coreWidth = Math.min(tileSize, source.width - sourceX);
        const coreHeight = Math.min(tileSize, source.height - sourceY);
        const canvas = document.createElement('canvas');
        canvas.width = tileSize + gutter * 2;
        canvas.height = tileSize + gutter * 2;
        const context = canvas.getContext('2d')!;

        context.drawImage(source, sourceX, sourceY, coreWidth, coreHeight, gutter, gutter, coreWidth, coreHeight);
        const leftX = sourceX > 0 ? sourceX - gutter : sourceX;
        const leftWidth = sourceX > 0 ? gutter : 1;
        const rightX = Math.min(source.width - 1, sourceX + coreWidth);
        const rightWidth = sourceX + coreWidth < source.width ? gutter : 1;
        const topY = sourceY > 0 ? sourceY - gutter : sourceY;
        const topHeight = sourceY > 0 ? gutter : 1;
        const bottomY = Math.min(source.height - 1, sourceY + coreHeight);
        const bottomHeight = sourceY + coreHeight < source.height ? gutter : 1;

        context.drawImage(source, leftX, sourceY, leftWidth, coreHeight, 0, gutter, gutter, coreHeight);
        context.drawImage(source, rightX, sourceY, rightWidth, coreHeight, gutter + coreWidth, gutter, gutter, coreHeight);
        context.drawImage(source, sourceX, topY, coreWidth, topHeight, gutter, 0, coreWidth, gutter);
        context.drawImage(source, sourceX, bottomY, coreWidth, bottomHeight, gutter, gutter + coreHeight, coreWidth, gutter);
        context.drawImage(source, leftX, topY, leftWidth, topHeight, 0, 0, gutter, gutter);
        context.drawImage(source, rightX, topY, rightWidth, topHeight, gutter + coreWidth, 0, gutter, gutter);
        context.drawImage(source, leftX, bottomY, leftWidth, bottomHeight, 0, gutter + coreHeight, gutter, gutter);
        context.drawImage(source, rightX, bottomY, rightWidth, bottomHeight, gutter + coreWidth, gutter + coreHeight, gutter, gutter);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.offset.set(gutter / canvas.width, gutter / canvas.height);
        texture.repeat.set(coreWidth / canvas.width, coreHeight / canvas.height);
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 8;
        tiles.push({ x, y, columns, rows, texture });
      }
    }

    levels.push({ level, columns, rows, tiles });
    if (source.width <= tileSize && source.height <= tileSize) break;

    const reduced = document.createElement('canvas');
    reduced.width = Math.max(tileSize, Math.ceil(source.width / 2));
    reduced.height = Math.max(tileSize, Math.ceil(source.height / 2));
    reduced.getContext('2d')!.drawImage(source, 0, 0, reduced.width, reduced.height);
    source = reduced;
    level++;
  }

  return levels;
}

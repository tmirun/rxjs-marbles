import type { G, Svg } from '@svgdotjs/svg.js';
import { COLORS } from './colors';

interface Options {
  x: number;
  y1: number;
  y2: number;
  color?: string;
}

export function dashLine(draw: Svg | G, { x, y1, y2, color }: Options) {
  color = color || COLORS.finishLine;
  draw.line(x, y1, x, y2).stroke({ dasharray: '5', color });
}

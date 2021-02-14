import { G, Svg } from '@svgdotjs/svg.js';

interface Options {
  x: number;
  y1: number;
  y2: number;
  color: string;
}

export function dashLine(draw: Svg | G, { x, y1, y2, color }: Options) {
  console.log('draw line');
  color = color || '#000';
  draw.line(x, x, y1, y2).stroke({ dasharray: '5', color });
}

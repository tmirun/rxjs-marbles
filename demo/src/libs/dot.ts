import { G, Svg } from '@svgdotjs/svg.js';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { isObservable } from 'rxjs';
import { COLORS } from './colors';

interface Options {
  value: any;
  cy: number;
  cx: number;
  color: string;
}

export const RX_DOT_SIZE = 30;
export const RX_DOT_RADIUS = RX_DOT_SIZE / 2;
export const RX_DOT_STROKE = 4;
export const RX_DOT_RADIUS_OUTER = RX_DOT_RADIUS + RX_DOT_STROKE;

export function dot(draw: Svg | G, { value, cx, cy, color }: Options) {
  let label = '';

  const dot = draw.group().addClass('rx-dot');

  if (isObservable(value)) {
    dot
      .circle()
      .center(0, 0)
      .fill(COLORS.dotGrey)
      .opacity(0.8)
      .animate()
      .size(RX_DOT_SIZE, RX_DOT_SIZE);
    label = 'create new observable';
  } else {
    label = value.toString();
    const text = label.length > 3 ? '...' : label;
    dot
      .circle(0)
      .center(0, 0)
      .fill('rgba(255, 255, 255, 0.9)')
      .stroke({ color: color, width: RX_DOT_STROKE })
      .animate()
      .size(RX_DOT_SIZE, RX_DOT_SIZE);

    dot.text(text).center(0, 0).attr({ fill: '#000' }).attr({
      style: 'user-select: none; cursor: default; outline: none'
    });
  }

  tippy([dot.node], {
    content: label,
    placement: 'top'
  });

  dot.opacity(0).animate().attr({ opacity: 1 });

  dot.transform({
    translateX: cx,
    translateY: cy
  });

  return dot;
}

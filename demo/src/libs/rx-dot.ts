import { G, Svg } from '@svgdotjs/svg.js';
import tippy from 'tippy.js';
import { RxAxisType } from './rx-axis';
import 'tippy.js/dist/tippy.css';

interface Options {
  value: string;
  cy: number;
  color: string;
  rxAxisType: RxAxisType;
}

export const RX_DOT_SIZE = 30;
export const RX_DOT_RADIUS = RX_DOT_SIZE / 2;
export const RX_DOT_STROKE = 4;
export const RX_DOT_RADIUS_OUTER = RX_DOT_RADIUS + RX_DOT_STROKE;

export function drawDot(draw: Svg | G, { value, cy, color, rxAxisType }: Options) {
  const originalValue = value.toString();
  const text = originalValue.length > 3 ? '...' : originalValue;

  const dot = draw.group();

  const dashLine = dot.line(0, 0, 0, 0).stroke({ dasharray: '5', color: '#000' });

  switch (rxAxisType) {
    case 'start':
      dashLine.attr({ y1: cy, y2: cy });
      break;
    case 'middle':
      dashLine.attr({ y1: 0, y2: cy });
      break;
    case 'final':
      dashLine.attr({ y1: 0, y2: cy });
      break;
  }

  const circleGroup = dot.group();
  circleGroup
    .circle(0)
    .center(0, cy)
    .fill('#fff')
    .stroke({ color: color, width: RX_DOT_STROKE })
    .animate()
    .size(RX_DOT_SIZE, RX_DOT_SIZE);

  circleGroup.text(text).center(0, cy).attr({ fill: '#000' }).attr({
    style: 'user-select: none; cursor: default; outline: none'
  });

  tippy([circleGroup.node], {
    content: originalValue,
    placement: 'top'
  });

  dot.opacity(0).animate().attr({ opacity: 1 });

  return dot;
}

import { RX_DOT_SIZE } from './dot';
import { COLORS } from './colors';
import { G, Svg } from '@svgdotjs/svg.js';

const RX_COMPLETE_LINE_HEIGHT = RX_DOT_SIZE + 10;
const RX_COMPLETE_LINE_LINE_WIDTH = 2;

export function drawCompleteLine(draw: Svg | G, x: number, cy: number) {
  const group = draw.group().back();
  group.rect(4, RX_COMPLETE_LINE_HEIGHT).fill(COLORS.finishLine).center(x, cy).front();

  const finalLine = group
    .rect(RX_DOT_SIZE, RX_COMPLETE_LINE_LINE_WIDTH)
    .center(0, cy)
    .fill(COLORS.finishLine)
    .x(x);

  group.back().polygon(`0,0 0,10 10,5`).fill(COLORS.finishLine).center(finalLine.bbox().x2, cy);
}

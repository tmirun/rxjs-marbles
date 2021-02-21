import { presetPalettes } from '@ant-design/colors';

export const colors = Object.values(presetPalettes).map((colors) => {
  return colors[4];
});

export const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

export const COLORS = {
  finishLine: presetPalettes.grey[1],
  dashLine: presetPalettes.grey[2],
  dotGrey: presetPalettes.grey[0]
};

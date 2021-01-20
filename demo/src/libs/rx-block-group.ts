import { G, Svg } from '@svgdotjs/svg.js';

export class RxBlockGroup {
  public group: G;

  constructor(draw: Svg | G) {
    this.group = draw.group()
  }

  private _x = 0;
  get x() {
    return this.x
  };

  set x(value: number) {
    this._x = value;
    this.group.transform({translateX: this._x})
  }

  private _y = 0;
  get y() {
    return this._y
  };

  set y(value: number) {
    this._y = value;
    this.group.transform({translateY: this._y})
  }
}

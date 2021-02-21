import { G, Svg } from '@svgdotjs/svg.js';

export interface RxDrawerOptions {
  x?: number;
  y?: number;
}

export abstract class RxDrawer {
  public group: G;
  protected padding: number = 0;
  get paddingX2() {
    return this.padding * 2;
  }

  /**
   * @param draw: SVG or G element
   * @param className:
   * @param options: x and y option
   * @protected
   */
  protected constructor(draw: Svg | G, className: string, options?: RxDrawerOptions) {
    this.group = draw.group().addClass(className);
    if (options?.x) {
      this.x = options.x;
    }
    if (options?.y) {
      this.y = options.y;
    }
  }

  private _x = 0;
  get x() {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
    this.group.transform({ translateX: this._x, translateY: this._y });
  }

  private _y = 0;
  get y() {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
    this.group.transform({ translateX: this._x, translateY: this._y });
  }

  xy(x: number, y: number) {
    this._y = y;
    this._x = x;
    this.group.transform({ translateX: this._x, translateY: this._y });
  }

  abstract destroy(): void;
}

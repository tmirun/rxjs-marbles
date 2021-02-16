import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxDrawer } from './rx-drawer';
import { getRandomColor } from './colors';
import { dot } from './dot';
import { drawCompleteLine } from './complete-line';

export type RxAxisType = 'start' | 'final' | 'none' | 'middle';

export class RxAxis extends RxDrawer {
  public static height = 60;
  public lineWidth = 2;
  public subscriptions = new Subscription();

  private _axis: Rect;
  private _color = getRandomColor();
  private _timeline: Timeline;
  private _type: RxAxisType = 'none';
  private readonly _startTimeXAt: number;
  private _source: Observable<any>;
  private get cy() {
    return RxAxis.height / 2;
  }

  constructor(
    draw: Svg | G,
    source$: Observable<any>,
    timeline: Timeline,
    type: RxAxisType = 'none'
  ) {
    super(draw, 'observable-line');
    this._timeline = timeline;
    this._type = type;
    this._source = source$;
    this._startTimeXAt = timeline.counter;

    // draw line
    this._axis = this.group.rect(0, this.lineWidth).center(0, this.cy);

    const timelineSubscription = timeline.time$.subscribe({
      next: () => {
        this._axis.animate(this._timeline.period, '=').width(this.getCurrentX(-1)); // it is 1 step behind than dot
      },
      complete: () => this._complete()
    });
    this.subscriptions.add(timelineSubscription);

    // subscribe to observable
    const sourceSubscription = source$.subscribe({
      next: (value) => {
        dot(this.group, {
          value,
          color: this._color,
          cy: this.cy,
          cx: this.getCurrentX()
        });
      },
      complete: () => this._complete()
    });
    this.subscriptions.add(sourceSubscription);
  }

  public destroy() {
    this.subscriptions.unsubscribe();
  }

  private _complete() {
    drawCompleteLine(this.group, this.getCurrentX(), this.cy);
    this.subscriptions.unsubscribe();
  }

  private getCurrentX(offset = 0) {
    return this._timeline.getTimeSpace(this._startTimeXAt + offset);
  }
}

import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { isObservable, Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxDrawer, RxDrawerOptions } from './rx-drawer';
import { getRandomColor } from './colors';
import { dot } from './dot';
import { drawCompleteLine } from './complete-line';
import { dashLine } from './dash-line';
import { throwFromEvent } from './rx-event';

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
    type: RxAxisType = 'none',
    options?: RxDrawerOptions
  ) {
    super(draw, 'observable-line', options);
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
        const x = this.getCurrentX();
        this._drawDashLine(x);
        dot(this.group, {
          value,
          color: this._color,
          cy: this.cy,
          cx: x
        });

        // this is draw dash line
        if (isObservable(value)) {
          throwFromEvent(this.y + this.cy);
        }
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

  private _drawDashLine(x: number) {
    if (this._type === 'start') {
      dashLine(this.group, {
        x: x,
        y1: this.cy,
        y2: RxAxis.height
      });
    }

    if (this._type === 'middle') {
      dashLine(this.group, {
        x: x,
        y1: 0,
        y2: RxAxis.height
      });
    }
    if (this._type === 'final') {
      dashLine(this.group, {
        x: x,
        y1: 0,
        y2: this.cy
      });
    }
  }

  private getCurrentX(offset = 0) {
    return this._timeline.getTimeSpace(this._startTimeXAt + offset);
  }
}

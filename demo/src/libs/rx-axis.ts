import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxBlockGroup } from './rx-block-group';
import { COLORS, getRandomColor } from './colors';
import { drawDot, RX_DOT_RADIUS, RX_DOT_RADIUS_OUTER, RX_DOT_SIZE } from './dot';

export type RxAxisType = 'start' | 'final' | 'none' | 'middle';

export class RxAxis extends RxBlockGroup {
  public static height = 60;
  private axis: Rect;

  public lineWidth = 2;
  public subscription: Subscription | undefined;
  public timelineSubscription: Subscription | undefined;
  public completeNextTime = false;
  private color = getRandomColor();
  private timeline: Timeline;
  private readonly startTimeCountAt: number;
  private get middleY() {
    return RxAxis.height / 2;
  }

  constructor(
    draw: Svg | G,
    observable$: Observable<any>,
    timeline: Timeline,
    type: RxAxisType = 'none'
  ) {
    super(draw, 'observable-line');
    this.timeline = timeline;
    this.axis = this.group.rect(0, this.lineWidth).center(0, this.middleY);
    this.startTimeCountAt = timeline.counter;

    this.timelineSubscription = timeline.time$.subscribe(() => {
      this.axis
        // .animate({ duration: this.timeline.period, ease: 'linear' })
        .width(this.getTimeSpace());
    });

    // subscribe to observable
    this.subscription = observable$.subscribe({
      next: (value) => {
        console.log('draw dot');
        drawDot(this.group, {
          value,
          color: this.color,
          cy: this.middleY,
          rxAxisType: type
        }).transform({
          translateX: this.getTimeSpace()
        });

        if (this.completeNextTime) {
          this._complete();
        }
      },
      complete: () => this._complete
    });
  }

  private _drawCompleteLine() {
    const x = this.getTimeSpace() + RX_DOT_RADIUS_OUTER;

    this.group
      .rect(4, RX_DOT_RADIUS * 2)
      .center(x, this.middleY)
      .front();

    const finalLine = this.group
      .rect(RX_DOT_SIZE, this.lineWidth)
      .center(0, this.middleY)
      .fill(COLORS.finishLineColor)
      .x(x)
      .back();

    this.group
      .polygon(`0,0 0,10 10,5`)
      .fill(COLORS.finishLineColor)
      .center(finalLine.bbox().x2, this.middleY);
  }

  private _complete() {
    this._drawCompleteLine();
    this._unsubscribe();
  }

  public destroy() {
    this._unsubscribe();
  }

  private _unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    if (this.timelineSubscription) {
      this.timelineSubscription.unsubscribe();
      this.timelineSubscription = undefined;
    }
  }

  private getTimeSpace() {
    return this.timeline.getTimeSpace(this.startTimeCountAt);
  }
}

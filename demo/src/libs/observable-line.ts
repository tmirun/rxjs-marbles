import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxBlockGroup } from './rx-block-group';
import './colors';
import { getRandomColor } from './colors';

export class ObservableLine extends RxBlockGroup {
  public static height = 80;
  private axis: Rect;

  public lineWidth = 2;
  public dotSize = 30;
  public subscription: Subscription | undefined;
  public timelineSubscription: Subscription | undefined;
  public completeNextTime = false;
  private color = getRandomColor();
  private timeline: Timeline;

  get dotRadius() {
    return this.dotSize / 2;
  }
  private get middleY() {
    return ObservableLine.height / 2;
  }

  constructor(draw: Svg | G, observable$: Observable<any>, timeline: Timeline) {
    super(draw, 'observable-line');
    this.timeline = timeline;
    this.axis = this.group.rect(0, this.lineWidth).center(0, this.middleY);

    this.timelineSubscription = timeline.time$.subscribe(() => {
      this.axis
        .animate({ duration: timeline.period, ease: 'linear' })
        .width(timeline.getTimeSpace());

      console.log(timeline.getTimeSpace());
    });

    // subscribe to observable
    this.subscription = observable$.subscribe({
      next: (value) => {
        this._drawDot(value);

        if (this.completeNextTime) {
          this.complete();
        }
      },
      complete: () => this.complete
    });
  }

  complete() {
    this._drawCompleteLine();
    this._unsubscribe();
  }

  private _drawDot(value = 'n') {
    value = value.toString();
    if (value.length > 3) {
      value = '...';
    }
    const dot = this.group.group();
    const dashLine = dot
      .line(0, 0, 0, ObservableLine.height)
      .stroke({ dasharray: '5', color: '#000' });

    const circle = dot
      .circle(0)
      .center(0, this.middleY)
      .fill('#fff')
      .stroke({ color: this.color, width: 4 })
      .animate()
      .size(this.dotSize, this.dotSize);

    const text = dot.text(value.toString()).center(0, this.middleY).attr({ fill: '#000' });

    dot
      .transform({
        translateX: this.timeline.getTimeSpace()
      })
      .opacity(0)
      .animate()
      .attr({ opacity: 1 });
  }

  private _drawCompleteLine() {
    const x = this.timeline.getTimeSpace() + this.dotRadius;
    this.group
      .rect(4, this.dotSize + 10)
      .center(x, this.middleY)
      .back();
    const finalLine = this.group
      .rect(this.dotSize + 10, this.lineWidth)
      .center(0, this.middleY)
      .x(x)
      .back();

    this.group.polygon(`0,0 0,10 10,5`).center(finalLine.bbox().x2, this.middleY);
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
}

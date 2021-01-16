import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { throttle } from 'rxjs/operators';

export class ObservableLine {
  public timeCounter = 0;
  public group: G;
  private axis: Rect;
  public lineWidth = 2;
  public dotSize = 30;
  get dotRadius(){return this.dotSize / 2};
  public subscription: Subscription | undefined;
  public timelineSubscription: Subscription | undefined;
  public timeSpace = 1;
  public completeNextTime = false;

  private height = 60;
  private get middleY () { return this.height / 2}

  constructor(svg: Svg, observable$: Observable<any>, timeline: Timeline, startX = 0, startY = 0, id: string) {
    this.group = svg.group();
    this.axis = this.group.rect(0, this.lineWidth).center(0, this.middleY);

    this.timelineSubscription = timeline.time$.subscribe(() => {
      this.timeCounter++;
      this.axis.width(this.getTimeSpace());
    })

    this.subscription = observable$
      .pipe(throttle( () => timeline.time$))
      .subscribe({
        next: (value) => {
          this._drawDot(value)

          if(this.completeNextTime) {
            this.complete()
          }
        },
        complete: () => this.complete
      });

    this.group.transform({
      translateX: startX,
      translateY: startY
    })
  }

  complete() {
    this._drawCompleteLine();
    this._unsubscribe()
  }

  getTimeSpace() {
    return this.timeCounter * this.timeSpace;
  }

  private _drawDot(value = 'a') {
    const dot = this.group.group();
    dot.circle(this.dotSize)
      .center(this.dotRadius, this.dotRadius)
      .fill('white')
      .stroke('black');

    dot.text(value.toString())
      .center(this.dotRadius, this.dotRadius);

    dot.transform({
      translateX: this.getTimeSpace(),
      translateY: this.middleY - this.dotRadius
    })
  }

  private _drawCompleteLine() {
    const x = this.getTimeSpace() + this.dotRadius;
    this.group.rect(4, this.dotSize + 10)
      .center(x, this.middleY)
      .back();
    const finalLine = this.group.rect(this.dotSize + 10, this.lineWidth)
      .center(0, this.middleY).x(x)
      .back()

    this.group.polygon(`0,0 0,10 10,5`).center(finalLine.bbox().x2, this.middleY)
  }

  private _unsubscribe() {
    if(this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    if(this.timelineSubscription) {
      this.timelineSubscription.unsubscribe();
      this.timelineSubscription = undefined;
    }
  }
}

import { G, Rect, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxBlockGroup } from './rx-block-group';

interface Options {
  x: number,
  y: number,
  id?: string
}

export class ObservableLine extends RxBlockGroup {
  public static height = 60;
  private axis: Rect;

  public timeCounter = 0;
  public lineWidth = 2;
  public dotSize = 30;
  public subscription: Subscription | undefined;
  public timelineSubscription: Subscription | undefined;
  public timeSpace = 1;
  public completeNextTime = false;

  get dotRadius(){return this.dotSize / 2};
  private get middleY () { return ObservableLine.height / 2}

  constructor(draw: Svg | G, observable$: Observable<any>, timeline: Timeline, {x = 0, y = 0}: Options ) {
    super(draw);

    this.group = draw.group().addClass('observable-line');
    this.axis = this.group.rect(0, this.lineWidth).center(0, this.middleY);

    this.timelineSubscription = timeline.time$.subscribe(() => {
      this.timeCounter++;
      this.axis.width(this.getTimeSpace());
    })

    // subscribe to observable
    this.subscription = observable$
      .subscribe({
        next: (value) => {
          this._drawDot(value)

          if(this.completeNextTime) {
            this.complete()
          }
        },
        complete: () => this.complete
      });

    this.group.transform({ translateX: x, translateY: y})
  }

  complete() {
    this._drawCompleteLine();
    this._unsubscribe()
  }

  getTimeSpace() {
    return this.timeCounter * this.timeSpace;
  }

  private _drawDot(value = 'n') {
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

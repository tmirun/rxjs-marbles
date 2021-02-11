import { Svg, SVG } from '@svgdotjs/svg.js';
import { isObservable, Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RxObservable } from './rx-observable';

export class RxMarbles {
  public timeline = new Timeline();
  public draw: Svg;
  public rxObservables: RxObservable[] = [];
  public padding = 20;
  private currentY = 0;
  private showOperators = true;
  private subscriptions: Subscription = new Subscription();
  private element: HTMLElement;

  constructor(parent: string, source$: Observable<any>) {
    this.element = document.querySelector(parent) as HTMLElement;
    this.element.style.width = '100%';
    this.element.style.overflow = 'auto';

    this.draw = SVG().addTo(this.element).size(0, 0);

    this.timeline.time$.pipe().subscribe(
      () => {
        this.refreshSvgSize();
        this.refreshElementScrollLeft();
      },
      null,
      () => {
        this.timeline.stop();
      }
    );

    const source$1 = source$.pipe();

    this.subscribe(source$);
    this.timeline.start();
  }

  subscribe(observable$: Observable<any>) {
    const observable = new RxObservable(this.draw, observable$, this.timeline, {
      showOperators: this.showOperators
    });
    observable.x = this.timeline.getTimeSpace() + this.padding;
    observable.y = this.currentY + this.padding;
    this.rxObservables.push(observable);
    this.currentY += observable.height;

    // when detect other subscriber
    const subscription = observable$.subscribe((value) => {
      if (isObservable(value)) {
        this.subscribe(value);
      }
    });

    this.subscriptions.add(subscription);
  }

  refreshSvgSize() {
    let height = 0;
    let width = 0;
    // todo change prefix name rx
    this.rxObservables.forEach((observablesMarble, index) => {
      width = Math.max(observablesMarble.group.width() + observablesMarble.x, width);
      height = Math.max(observablesMarble.group.height() + observablesMarble.y, height);
    });

    this.draw
      .animate({ duration: this.timeline.period })
      .width(width + this.padding)
      .height(height + this.padding);
  }

  refreshElementScrollLeft() {
    const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth;
    const offset = 20; // in px
    const keepScrollToRight =
      this.element.scrollWidth - offset < this.element.clientWidth + this.element.scrollLeft;
    if (keepScrollToRight) {
      this.element.scrollTo({
        left: maxScrollLeft
      });
    }
  }

  destroy() {
    this.draw.remove();
    this.subscriptions.unsubscribe();
    this.timeline.finish();
    this.rxObservables.forEach((rxObservable) => {
      rxObservable.destroy();
    });
  }
}

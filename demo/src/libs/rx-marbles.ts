import { Svg, SVG } from '@svgdotjs/svg.js';
import { isObservable, Observable, Subscription } from 'rxjs';
import { Timeline } from './timeline';
import { RX_OBSERVABLE_PADDING, RxObservable } from './rx-observable';
import { dashLine } from './dash-line';
import { RxAxis } from './rx-axis';
import { RX_EVENT_FROM_Y } from './rx-event';

export class RxMarbles {
  private element: HTMLElement;
  public timeline = new Timeline();
  public draw: Svg;
  public rxObservables: RxObservable[] = [];
  public padding = 20;
  private showOperators = true;
  private _subscriptions: Subscription = new Subscription();
  private _currentY = 0;
  private _fromY = 0; // from dash line

  constructor(parent: string, source$: Observable<any>) {
    this.element = document.querySelector(parent) as HTMLElement;

    this._initializeElement(this.element);
    this.draw = SVG().addTo(this.element).size(0, 0);

    this.timeline.time$.subscribe(() => {
      this.refreshSvgSize();
      this.refreshElementScrollLeft();
    });

    window.addEventListener(RX_EVENT_FROM_Y, (event: any) => {
      this._fromY = event.detail;
    });

    this.subscribe(source$);
    this.timeline.start();
  }

  private _initializeElement(element: HTMLElement) {
    element.style.width = '100%';
    element.style.overflow = 'auto';
  }

  subscribe(observable$: Observable<any>) {
    const rxObservable = new RxObservable(this.draw, observable$, this.timeline, {
      x: this.timeline.getTimeSpace(),
      y: this._currentY,
      showOperators: this.showOperators
    });
    this.rxObservables.push(rxObservable);
    this._currentY += rxObservable.height;

    // when detect other subscriber
    const subscription = observable$.subscribe((value) => {
      if (isObservable(value)) {
        dashLine(this.draw, {
          x: this.timeline.getTimeSpace() + RX_OBSERVABLE_PADDING,
          y1: this._fromY,
          y2: this._currentY + RxAxis.height / 2
        });
        this.subscribe(value);
      }
    });

    this._subscriptions.add(subscription);
  }

  refreshSvgSize() {
    let height = 0;
    let width = 0;
    // todo change prefix name rx
    this.rxObservables.forEach((observablesMarble, index) => {
      width = Math.max(observablesMarble.group.width() + observablesMarble.x, width);
      // height = Math.max(observablesMarble.group.height() + observablesMarble.y, height);
      height += observablesMarble.height;
    });

    this.draw
      .animate({ duration: this.timeline.period })
      .width(width + this.padding)
      .height(height + this.padding);
  }

  refreshElementScrollLeft() {
    const maxScrollLeft = this.element.scrollWidth - this.element.clientWidth;
    const offset = 20;
    const keepScrollToRight =
      this.element.scrollWidth - offset < this.element.clientWidth + this.element.scrollLeft;
    if (keepScrollToRight) {
      this.element.scrollTo({
        left: maxScrollLeft + 10,
        behavior: 'smooth'
      });
    }
  }

  destroy() {
    this.draw.remove();
    this.timeline.finish();
    this._subscriptions.unsubscribe();
    this.rxObservables.forEach((rxObservable) => {
      rxObservable.destroy();
    });
  }
}

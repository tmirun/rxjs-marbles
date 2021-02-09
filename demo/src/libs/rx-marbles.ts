import { Svg, SVG } from '@svgdotjs/svg.js';
import { Observable, isObservable, Subject, Subscription, observable } from 'rxjs';
import { Timeline } from './timeline';
import { RxObservable } from './rx-observable';

export class RxMarbles {
  public timeline = new Timeline();
  public svg: Svg;
  public rxObservables: RxObservable[] = [];
  public padding = 20;
  private currentY = 0;
  private showOperators = false;
  private subscriptions: Subscription = new Subscription();

  constructor(svgElement: string, source$: Observable<any>) {
    this.svg = SVG().addTo(svgElement).size(0, 0);

    this.timeline.time$.pipe().subscribe(
      () => {
        this.refreshSvgSize();
      },
      null,
      () => {
        this.timeline.stop();
      }
    );

    this.subscribe(source$);
    this.timeline.start();
  }

  subscribe(observable$: Observable<any>) {
    const observable = new RxObservable(this.svg, observable$, this.timeline, {
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

    this.svg
      .animate({ duration: this.timeline.period })
      .width(width + this.padding)
      .height(height + this.padding);
  }

  destroy() {
    this.svg.remove();
    this.subscriptions.unsubscribe();
    this.timeline.finish();
    this.rxObservables.forEach((rxObservable) => {
      rxObservable.destroy();
    });
    // TODO
  }
}

import { Svg, SVG } from '@svgdotjs/svg.js';
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { RxObservable } from './rx-observable';

export class RxMarbles {
  public timeline = new Timeline();
  public svg: Svg;
  public observablesMarbles: RxObservable[] = [];
  public padding = 20;
  private currentY = 0;

  constructor(svgElement: string) {
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

    this.timeline.start();
  }

  subscribe(observable$: Observable<any>) {
    const observableMarble = new RxObservable(this.svg, observable$, this.timeline);
    observableMarble.x = this.timeline.getTimeSpace() + this.padding;
    observableMarble.y = this.currentY + this.padding;
    this.observablesMarbles.push(observableMarble);
    this.currentY += observableMarble.height;

    // when detect other subscriber
    observable$.subscribe((value) => {
      if (isObservable(value)) {
        this.subscribe(value);
      }
    });
  }

  refreshSvgSize() {
    let height = 0;
    let width = 0;
    this.observablesMarbles.forEach((observablesMarble, index) => {
      width = Math.max(observablesMarble.group.width() + observablesMarble.x, width);
      height = Math.max(observablesMarble.group.height() + observablesMarble.y, height);
    });

    this.svg
      .animate({ duration: this.timeline.period })
      .width(width + this.padding)
      .height(height + this.padding);
  }
}

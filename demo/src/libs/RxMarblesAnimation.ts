import { Svg, SVG } from '@svgdotjs/svg.js';
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { ObservableMarble } from './observable-marbles';

export class RxMarblesAnimation {
  public timeline = new Timeline();
  public svg: Svg;
  public observablesMarbles: ObservableMarble[] = [];
  public padding = 10;

  constructor(svgElement: string) {
    this.svg = SVG().addTo(svgElement).size('auto', 600);

    this.timeline.start();
    this.timeline.time$.subscribe(() => {
      this.refreshSvgSize();
    });
  }

  subscribe(observable$: Observable<any>) {
    const observableMarble = new ObservableMarble(this.svg, observable$, this.timeline);
    observableMarble.x = this.padding;
    observableMarble.y = this.padding;
    this.observablesMarbles.push(observableMarble);

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
    this.observablesMarbles.forEach((observablesMarble) => {
      width = Math.max(observablesMarble.group.width() + observablesMarble.x, width);
      height = Math.max(observablesMarble.group.height(), height);
    });

    this.svg
      .animate({ duration: this.timeline.period })
      .width(width + this.padding * 2)
      .height(height + this.padding * 2);
  }
}

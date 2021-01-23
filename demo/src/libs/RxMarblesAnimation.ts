import { Svg, SVG } from '@svgdotjs/svg.js';
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { ObservableMarble } from './observable-marbles';

export class RxMarblesAnimation {
  public timeline = new Timeline();
  public svg: Svg;
  public observablesMarbles: ObservableMarble[] = [];
  public padding = 20;

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
    this.observablesMarbles.push(observableMarble);
    observable$.subscribe((value) => {
      if (isObservable(value)) {
        this.subscribe(value);
      }
    });
  }

  refreshSvgSize() {
    this.observablesMarbles.forEach((observablesMarble) => {
      this.svg
        .animate({ duration: this.timeline.period })
        .width(observablesMarble.group.width() + this.padding * 2)
        .height(observablesMarble.group.height() + this.padding * 2);
    });
  }
}

import { Svg, SVG } from '@svgdotjs/svg.js'
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { ObservableMarble } from './observable-marbles';

export class RxMarblesAnimation {
  public timeline = new Timeline();
  public svg: Svg;
  public observablesMarbles: ObservableMarble[] = [];

  constructor(svgElement: string) {
    this.svg = SVG().addTo(svgElement).size(600, 600);
    this.timeline.start();
  }

  subscribe(observable$: Observable<any>) {
    const observableMarble = new ObservableMarble(this.svg, observable$, this.timeline);
    this.observablesMarbles.push(observableMarble);
    observable$.subscribe((value) => {
      if (isObservable(value)) {
        this.subscribe(value);
      }
    });
  }
}

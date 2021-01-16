import { Svg, SVG } from '@svgdotjs/svg.js'
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { ObservableLine } from './observable-line';
import { ObservableOperations } from './observable-operator';

export class RxMarblesAnimation {
  public timeline = new Timeline();
  public svg: Svg;
  public timelineRunning = false;
  public timelineCounter = 0;
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
        this.subscribe(observable$);
      }
    })
  }

  run(timeoutMillisecond = 1000) {
    // execute code here
    this.timelineCounter ++;

    // go next frame
    setTimeout(() => {
      if (this.timelineRunning) {
        this.run(timeoutMillisecond)
      }
    }, timeoutMillisecond);
  }
}

export class ObservableMarble {
  public observableLines: ObservableLine[] = [];
  public showAllOperatorMarble = false;

  constructor(svg: Svg, source$: Observable<any>, timeline: Timeline) {
    svg.rect(400, 100).stroke('blue').fill('transparent');

    source$.subscribe({
      complete: () => {
        this._unsubscribeAll();
      }
    })

    let observables;
    if(this.showAllOperatorMarble){
      observables = this.extractObservableOperators(source$);
    } else {
      observables = [source$]
    }

    observables.forEach((observable: Observable<any>, index) => {
      const observableLine = new ObservableLine(svg, observable, timeline, 0, (index + 1) * 40, index.toString());
      this.observableLines.push(observableLine)
      new ObservableOperations(svg, observable);
    })
  }

  extractObservableOperators (observable$: Observable<any>, observables: Observable<any>[] = []) {
    observables.unshift(observable$)
    if(observable$.source){
      this.extractObservableOperators(observable$.source, observables)
    }
    return observables;
  }

  private _unsubscribeAll() {
    this.observableLines.forEach((observableLine) => {
      observableLine.completeNextTime = true;
    })
  }
}

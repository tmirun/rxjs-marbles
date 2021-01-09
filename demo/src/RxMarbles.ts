import { G, Rect, Svg, SVG } from '@svgdotjs/svg.js'
import { Observable, isObservable } from 'rxjs';
import { Timeline } from './timeline';
import { sample } from 'rxjs/operators';

export class RxMarblesAnimation {
  public timeline = new Timeline();
  public svg: Svg;
  public timelineRunning = false;
  public timelineCounter = 0;
  public observablesMarbles: ObservableMarble[] = [];

  constructor(svgElement: string) {
    this.svg = SVG().addTo(svgElement).size(600, 600);
    console.log('start');
    this.timeline.start();
  }

  drawObservable(observable$: Observable<any>) {
    observable$.subscribe((value) => {
      if(isObservable(value)) {

      }
    })
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

  drawCompleteLine(x: number, y: number){
    const lineHeight = 30;
    this.svg.line(x, y, x, lineHeight + y).stroke({width: 1, color: 'black'});
  }

  startTimeline() {
    this.timelineRunning = true;
    this.run(1000)
  }

  stopTimeline() {
    this.timelineRunning = false;
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
  public timeline: Timeline;
  public axis: ObservableLine;
  public timeCount = 0;

  constructor(svg: Svg, observable$: Observable<any>, timeline: Timeline) {
    this.timeline = timeline;
    svg.rect(70, 70).stroke('blue').fill('transparent');
    console.log(observable$);
    this.axis = new ObservableLine(svg, observable$, timeline, 0, 0);
    const observables = this.extractObservables(observable$);
    observables.forEach((observable: Observable<any>, index) => {
      new ObservableLine(svg, observable, timeline, 0, index * 40);
    })
  }

  extractObservables (observable$: Observable<any>, observables: Observable<any>[] = []) {
    observables.push(observable$)
    if(observable$.source){
      this.extractObservables(observable$.source, observables)
    }
    return observables;
  }
}

export class ObservableLine {
  public timeCounter = 0;
  public group: G;
  public svg: Svg;
  public axis: Rect;
  public height = 60;
  public lineWidth = 6;
  public dotSize = 40;

  constructor(svg: Svg, observable$: Observable<any>, timeline: Timeline, startX = 0, startY = 0) {
    this.svg = svg;
    this.group = svg.group().move(startX, startY)
    this.axis = this.group.rect(0, this.lineWidth).center(0, this.height/2);

    const timelineSubscription = timeline.time$.subscribe(() => {
      this.timeCounter++;
      this.axis.width( this.timeCounter * 10);
    })

    const observableSubscription = observable$
      .pipe(sample(timeline.time$))
      .subscribe({
        next: (value) => {
          this.drawDot(value)
        },
        complete: () => {
          timelineSubscription.unsubscribe();
          observableSubscription.unsubscribe();
          this.drawCompleteLine();
        }
      });
  }

  drawDot(value = 'a') {
    const dot = this.group.group();
    dot.circle(this.dotSize)
       .center(this.dotSize/2, this.dotSize/2)
       .fill('#f06');

    dot.text(value.toString())
       .center(this.dotSize/2, this.dotSize/2);

    dot.center(this.timeCounter * 10, this.height/2);
  }

  drawCompleteLine() {
    this.group.rect(4, this.dotSize).center(this.timeCounter * 10, this.height / 2)
  }
}

import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import * as SVG from '@svgdotjs/svg.js';

export class Timeline {
  public period = 100; // millisecond
  public start$ = new ReplaySubject(1);
  public stop$ = new Subject();
  public time$: Observable<number>;
  public counter = 0;
  public timeSpace = 1;
  public svgTimeline = new SVG.Timeline();

  constructor() {
    // ref: https://codepen.io/belfz/pen/WwrBej
    this.time$ = this.start$.pipe(
      switchMap(() => interval(this.period).pipe(takeUntil(this.stop$))),
      tap(() => this.counter++)
    );
  }

  start() {
    this.start$.next();
    this.svgTimeline.play();
  }

  stop() {
    this.stop$.next();
    this.svgTimeline.stop();
  }

  finish() {
    this.start$.complete();
    this.svgTimeline.finish();
  }

  getTimeSpace(offset: number = 0) {
    return (this.counter - offset) * this.timeSpace;
  }
}

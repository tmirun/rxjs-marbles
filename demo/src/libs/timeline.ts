import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

export class Timeline {
  public period = 500; // millisecond
  public start$ = new ReplaySubject(1);
  public stop$ = new Subject();
  public time$: Observable<number>;
  public counter = 0;
  public timeSpace = 3;

  constructor() {
    // ref: https://codepen.io/belfz/pen/WwrBej
    this.time$ = this.start$.pipe(
      tap(() => this.counter++),
      switchMap(() => interval(this.period).pipe(takeUntil(this.stop$)))
    );
  }

  start() {
    this.start$.next();
  }

  stop() {
    this.stop$.next();
  }

  getTimeSpace() {
    return this.counter * this.timeSpace;
  }
}

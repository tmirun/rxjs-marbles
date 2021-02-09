import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

export class Timeline {
  public period = 250; // millisecond
  public start$ = new ReplaySubject(1);
  public stop$ = new Subject();
  public time$: Observable<number>;
  public counter = 0;
  public timeSpace = 4;

  constructor() {
    // ref: https://codepen.io/belfz/pen/WwrBej
    this.time$ = this.start$.pipe(
      switchMap(() => interval(this.period).pipe(takeUntil(this.stop$))),
      tap(() => this.counter++)
    );
  }

  start() {
    this.start$.next();
  }

  stop() {
    this.stop$.next();
  }

  finish() {
    this.start$.complete();
  }

  getTimeSpace(offset: number = 0) {
    return (this.counter - offset) * this.timeSpace;
  }
}

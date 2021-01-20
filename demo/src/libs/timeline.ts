import { interval, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { mapTo, scan, switchMap, takeUntil, tap } from 'rxjs/operators';

export class Timeline {
  public period = 100; // millisecond
  public start$ = new ReplaySubject(1);
  public stop$ = new Subject();
  public time$: Observable<number>
  public counter = 0

  constructor() {
    // ref: https://codepen.io/belfz/pen/WwrBej
    this.time$ = this.start$.pipe(
        switchMap(() =>
          interval(this.period).pipe(takeUntil(this.stop$))
        ),
        mapTo(1),
        scan((acc, n) => n === 0 ? 0 : acc + n),
      );
  }

  start() {
    this.start$.next();
  }

  stop() {
    this.stop$.next();
  }
}

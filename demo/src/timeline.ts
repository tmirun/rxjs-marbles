import { interval, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { mapTo, scan, switchMap, takeUntil, tap } from 'rxjs/operators';

export class Timeline {
  public start$ = new ReplaySubject(1);
  public reset$ = new Subject();
  public stop$ = new Subject();
  public time$: Observable<number>

  constructor() {
    // ref: https://codepen.io/belfz/pen/WwrBej
    this.time$ = merge(
      this.start$.pipe(
        switchMap(() =>
          interval(500).pipe(takeUntil(this.stop$))
        ),
        mapTo(1),
      ),
      this.reset$.pipe(mapTo(0))
    ).pipe(
      scan((acc, n) => n === 0 ? 0 : acc + n),
    )
  }

  start() {
    this.start$.next();
  }

  stop() {
    this.stop$.next();
  }

  restart() {
    this.reset$.next();
  }
}

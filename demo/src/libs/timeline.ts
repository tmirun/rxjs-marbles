import { Subject } from 'rxjs';

export class Timeline {
  public period = 250; // millisecond
  public time$ = new Subject<number>();
  public counter = 0;
  public timeSpace = 10;
  public intervalId?: any;

  start() {
    this.intervalId = setInterval(() => {
      this.time$.next(this.counter);
      this.counter++;
    }, this.period);
  }

  stop() {
    if (this.intervalId) {
      clearInterval();
    }
  }

  finish() {
    this.time$.complete();
  }

  getTimeSpace(offset: number = 0) {
    return (this.counter - offset) * this.timeSpace;
  }
}

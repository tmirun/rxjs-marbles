import { RxAxis, RxAxisType } from './rx-axis';
import { Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { Timeline } from './timeline';
import { RxOperator } from './rx-operator';
import { RxDrawer } from './rx-drawer';
import { delay, last, takeUntil } from 'rxjs/operators';

export interface RxObservableOptions {
  showOperators?: boolean;
}

export class RxObservable extends RxDrawer {
  public padding = 24;

  public drawElements: RxAxis[] & RxOperator[] = [];
  public titleHeight = 20;
  public height = 0;
  private _currentY = 0;
  private startTimeCountAt;
  private observables: Observable<any>[];

  constructor(
    draw: Svg,
    source$: Observable<any>,
    timeline: Timeline,
    options: RxObservableOptions = {}
  ) {
    super(draw, 'observable-marbles');
    this._currentY += this.titleHeight;
    this.height += this.titleHeight;
    this.startTimeCountAt = timeline.counter;

    // temporal
    if (options) {
      options.showOperators = true;
    }

    if (options?.showOperators) {
      this.observables = this.getObservableOperators(source$);
    } else {
      this.observables = [source$];
    }

    this.observables.forEach((observable$: Observable<any>, index) => {
      if (observable$.source && options?.showOperators) {
        const rxOperator = new RxOperator(this.group, observable$, timeline);
        rxOperator.xy(0, this._currentY);
        this.drawElements.push(rxOperator);

        this._currentY += RxOperator.height;
        this.height += RxOperator.height;
      }

      let newObservable$ = observable$;
      /**
       * when stop origin obserbale  should stop all operators observable
       * ----A-----A-----A----|>
       * ----B-----B-----B----|>
       */
      if (this.observables.length > 1) {
        newObservable$ = observable$.pipe(takeUntil(source$.pipe(last(), delay(0))));
      }

      const rxAxis = new RxAxis(this.group, newObservable$, timeline, this._getRxAxisType(index));
      rxAxis.xy(this.padding, this._currentY);
      this._currentY += RxAxis.height;
      this.height += RxAxis.height;

      this.drawElements.push(rxAxis);
    });
  }

  /**
   * @param observable$: observable
   * @param observables: accomulator
   * @param source$: this is the origin observable
   * @description: this function return all operators observable
   * ----A-----A-----A->
   *     MAP OPERATOR
   * ----B-----B-----B->
   */
  getObservableOperators(
    observable$: Observable<any>,
    observables: Observable<any>[] = [],
    source$?: Observable<any>
  ): Observable<any>[] {
    if (!source$) {
      source$ = observable$;
    }

    observables.unshift(observable$);
    if (observable$.source) {
      this.getObservableOperators(observable$.source, observables, source$);
    }
    return observables;
  }

  public destroy() {
    this.drawElements.forEach((observableLine) => {
      observableLine.destroy();
    });
  }

  private _getRxAxisType(index: number): RxAxisType {
    if (this.observables.length === 1) {
      return 'none';
    }
    if (index === 0) {
      return 'start';
    }
    if (index === this.observables.length - 1) {
      return 'final';
    }
    return 'middle';
  }
}

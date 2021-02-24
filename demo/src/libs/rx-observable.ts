import { RxAxis, RxAxisType } from './rx-axis';
import type { Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { Timeline } from './timeline';
import { RxOperator } from './rx-operator';
import { RxDrawer, RxDrawerOptions } from './rx-drawer';
import { delay, last, takeUntil } from 'rxjs/operators';

export const RX_OBSERVABLE_PADDING = 24;

export interface RxObservableOptions extends RxDrawerOptions {
  showOperators?: boolean;
}

export class RxObservable extends RxDrawer {
  public padding = RX_OBSERVABLE_PADDING;

  public drawElements: RxAxis[] & RxOperator[] = [];
  public height = 0;
  private _currentY = 0;
  private _startTimeCountAt;
  private _observables: Observable<any>[];

  constructor(
    draw: Svg,
    source$: Observable<any>,
    timeline: Timeline,
    options?: RxObservableOptions
  ) {
    super(draw, 'observable-marbles', options);
    this._startTimeCountAt = timeline.counter;

    if (options?.showOperators) {
      this._observables = this.getObservableOperators(source$);
    } else {
      this._observables = [source$];
    }

    this._observables.forEach((observable$: Observable<any>, index) => {
      let newObservable$ = observable$;
      /**
       * when stop origin obserbale  should stop all operators observable
       * ----A-----A-----A----|>
       * ----B-----B-----B----|>
       */
      if (this._observables.length > 1) {
        newObservable$ = observable$.pipe(takeUntil(source$.pipe(last(), delay(0))));
      }

      if (observable$.source && options?.showOperators) {
        const rxOperator = new RxOperator(this.group, observable$, source$, timeline, {
          x: 0,
          y: this._currentY
        });
        this.drawElements.push(rxOperator);
        this._currentY += RxOperator.height;
        this.height += RxOperator.height;
      }

      const rxAxis = new RxAxis(this.group, newObservable$, timeline, this._getRxAxisType(index), {
        x: this.padding,
        y: this._currentY
      });
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
    if (this._observables.length === 1) {
      return 'none';
    }
    if (index === 0) {
      return 'start';
    }
    if (index === this._observables.length - 1) {
      return 'final';
    }
    return 'middle';
  }
}

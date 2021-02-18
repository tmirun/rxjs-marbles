import { RxAxis, RxAxisType } from './rx-axis';
import { Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { Timeline } from './timeline';
import { RxOperator } from './rx-operator';
import { RxDrawer } from './rx-drawer';
import { RX_DOT_RADIUS_OUTER } from './dot';
import { delay, last, takeUntil } from 'rxjs/operators';

export interface RxObservableOptions {
  showOperators: boolean;
}

export class RxObservable extends RxDrawer {
  public padding = 20;

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
    options?: RxObservableOptions
  ) {
    super(draw, 'observable-marbles');
    this._currentY += this.titleHeight;
    this.height += this.titleHeight;
    this.startTimeCountAt = timeline.counter;

    if (options) options.showOperators = true;

    // if (options?.showOperators) {
    if (true) {
      this.observables = this.getObservableOperators(source$);
    } else {
      this.observables = [source$];
    }

    this.observables.forEach((observable$: Observable<any>, index) => {
      if (observable$.source && options?.showOperators) {
        const observableOperations = new RxOperator(this.group, observable$, timeline);
        observableOperations.xy(0, this._currentY);
        this.drawElements.push(observableOperations);

        this._currentY += RxOperator.height;
        this.height += RxOperator.height;
      }

      const observableLine = new RxAxis(
        this.group,
        observable$,
        timeline,
        this._getRxAxisType(index)
      );
      observableLine.xy(RX_DOT_RADIUS_OUTER, this._currentY);
      this._currentY += RxAxis.height;
      this.height += RxAxis.height;

      this.drawElements.push(observableLine);
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
    let newObservable$ = observable$;

    if (!source$) {
      source$ = observable$;
    }

    /**
     * when stop origin obserbale  should stop all operators observable
     * ----A-----A-----A----|>
     * ----B-----B-----B----|>
     */
    if (observables.length) {
      newObservable$ = observable$.pipe(takeUntil(source$.pipe(last(), delay(0))));
    }

    observables.unshift(newObservable$);
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

import { RxAxis, RxAxisType } from './rx-axis';
import { Svg, Text } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { Timeline } from './timeline';
import { RxOperator } from './rx-operator';
import { RxBlockGroup } from './rx-block-group';
import { RX_DOT_RADIUS_OUTER } from './dot';

export interface RxObservableOptions {
  showOperators: boolean;
}

export class RxObservable extends RxBlockGroup {
  public padding = 20;

  public drawElements: RxAxis[] & RxOperator[] = [];
  public title: Text;
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
    this.title = this.group.text('observable$').attr({ 'font-weight': 'bold' });
    this._currentY += this.titleHeight;
    this.height += this.titleHeight;
    this.startTimeCountAt = timeline.counter;

    source$.subscribe({
      complete: () => {
        this._unsubscribeAll();
      }
    });

    if (options?.showOperators) {
      this.observables = this.getObservableOperators(source$);
    } else {
      this.observables = [source$];
    }

    this.observables.forEach((observable: Observable<any>, index) => {
      if (observable.source && options?.showOperators) {
        const observableOperations = new RxOperator(this.group, observable, timeline);
        observableOperations.xy(0, this._currentY);
        this.drawElements.push(observableOperations);

        this._currentY += RxOperator.height;
        this.height += RxOperator.height;
      }

      const observableLine = new RxAxis(
        this.group,
        observable,
        timeline,
        this._getRxAxisType(index)
      );
      observableLine.xy(RX_DOT_RADIUS_OUTER, this._currentY);
      this._currentY += RxAxis.height;
      this.height += RxAxis.height;

      this.drawElements.push(observableLine);
    });
  }

  getObservableOperators(
    observable$: Observable<any>,
    observables: Observable<any>[] = []
  ): Observable<any>[] {
    observables.unshift(observable$);
    if (observable$.source) {
      this.getObservableOperators(observable$.source, observables);
    }
    return observables;
  }

  private _unsubscribeAll() {
    this.drawElements.forEach((observableLine) => {
      observableLine.completeNextTime = true;
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

  public destroy() {
    this._unsubscribeAll();
    this.drawElements.forEach((rxAxisOrRxOperator) => {
      rxAxisOrRxOperator.destroy();
    });
  }
}

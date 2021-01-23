import { ObservableLine } from './observable-line';
import { G, Svg, Text } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { Timeline } from './timeline';
import { ObservableOperator } from './observable-operator';

export class ObservableMarble {
  public group: G;
  public drawElements: ObservableLine[] & ObservableOperator[] = [];
  public showAllOperatorMarble = true;
  public title: Text
  public titleHeight = 20;
  private _currentY = 0;

  constructor(draw: Svg, source$: Observable<any>, timeline: Timeline) {
    this.group = draw.group().addClass('observable-marbles')
    this.title = this.group.text('text')
    this._currentY += this.titleHeight;

    source$.subscribe({
      complete: () => {
        this._unsubscribeAll();
      }
    })

    let observables;
    if(this.showAllOperatorMarble){
      observables = this.getObservableOperators(source$);
    } else {
      observables = [source$]
    }

    observables.forEach((observable: Observable<any>, index) => {
      if(observable.source) {
        const observableOperations = new ObservableOperator(this.group, observable,
          timeline, {x: 0, y:  this._currentY });
        this.drawElements.push(observableOperations);

        this._currentY += ObservableOperator.height;
      }

      const observableLine = new ObservableLine(this.group, observable, timeline, {
        x: 0,
        y: this._currentY,
      });
      this._currentY += ObservableLine.height;

      this.drawElements.push(observableLine)
    })
  }

  getObservableOperators (observable$: Observable<any>, observables: Observable<any>[] = []): Observable<any>[] {
    observables.unshift(observable$)
    if(observable$.source){
      this.getObservableOperators(observable$.source, observables)
    }
    return observables;
  }

  private _unsubscribeAll() {
    this.drawElements.forEach((observableLine) => {
      observableLine.completeNextTime = true;
    })
  }
}

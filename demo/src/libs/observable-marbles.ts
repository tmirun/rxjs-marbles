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

  constructor(draw: Svg, source$: Observable<any>, timeline: Timeline) {
    this.group = draw.group().addClass('observable-marbles')
    this.title = this.group.text('text')

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

    console.log(this.title.bbox());
    observables.forEach((observable: Observable<any>, index) => {
      if(observable.source) {
        const observableOperations = new ObservableOperator(this.group, observable,
          {x: 0, y: (index * ObservableOperator.height + 20) });
        this.drawElements.push(observableOperations)
      }

      const observableLine = new ObservableLine(this.group, observable, timeline, {
        x: 0,
        y: index * ObservableLine.height + 20,
      });

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

  private calculatePositions() {
    let result = 0;
    this.drawElements.forEach((element) => {
      if(element instanceof ObservableLine) {
        result += ObservableLine.height
      }

      if(element instanceof ObservableOperator) {
        result += ObservableOperator.height
      }
    });

    return result;
  }
}

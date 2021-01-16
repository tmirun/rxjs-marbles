import { G, Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';

export class ObservableOperations {
  public group: G;
  public height = 60;

  constructor(svg: Svg, observable$: Observable<any>,) {
    this.group = svg.group();

    if(!observable$.operator) {
      console.warn('dont exist, observable$.operator')
      return;
    }

    console.log(this.getOperatorDescription(observable$))
  }

  getOperatorDescription(observable$: Observable<any>) {
    let result = '';
    result += observable$.operator.constructor.name + ':';
    // Object.keys(observable$.operator).forEach((key) => {
    //
    //   // @ts-ignore
    //   const value = observable$.operator[key]?.toString();
    //   if(value) {
    //     result =  `${result} ${key}: ${value}`
    //   }
    // })
    return result
  }
}

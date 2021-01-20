import { G, Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { RxBlockGroup } from './rx-block-group';

interface Options {
  x: number;
  y: number;
}

export class ObservableOperator extends RxBlockGroup{
  public static height = 40;

  constructor(draw: Svg | G, observable$: Observable<any>, {x, y}: Options) {
    super(draw);

    if(!observable$.operator) {
      // console.warn('dont exist, observable$.operator')
      return;
    }

    this.group = draw.group();

    const text = this.getOperatorDescription(observable$);

    this.group.text(text).move(x, y);
  }

  getOperatorDescription(observable$: Observable<any>) {
    // @ts-ignore
    console.dir(observable$)
    let result = '';
    const operatorName = observable$.operator?.constructor?.name.replace('Operator', '');
    // @ts-ignore
    let project = observable$.operator.project.toString();
    if(project) {
      if (project.length > 10) project = '...';
      console.log(project);
      return `${operatorName}(${project})`
    }

    // @ts-ignore
    let value = observable$.operator.value
    if(value) {
      return `${operatorName}(${value})`
    }

    Object.keys(observable$.operator).forEach((key) => {
      // @ts-ignore
      let value = observable$.operator[key]?.toString();
      if(value) {
        result =  `${operatorName}(${key}: ${value})`
      }
    })

    return result
  }
}

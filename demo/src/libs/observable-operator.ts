import { G, Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { RxBlockGroup } from './rx-block-group';
import { Timeline } from './timeline';

interface Options {
  x: number;
  y: number;
}

export class ObservableOperator extends RxBlockGroup {
  public static height = 40;

  constructor(draw: Svg | G, observable$: Observable<any>, timeline: Timeline, { x, y }: Options) {
    super(draw);

    this.group = draw.group().addClass('observable-operator');
    const description = this.getOperatorDescription(observable$);

    const text = this.group.text(description);

    const rect = this.group
      .rect(text.rbox().width, ObservableOperator.height)
      .stroke({ color: 'black', width: 3 })
      .fill('transparent');
    text.cy(ObservableOperator.height / 2);

    timeline.time$.subscribe(() => {
      // @ts-ignore
      const width = Math.max(text.rbox().width, this.group.parent().width());
      rect.animate({ duration: timeline.period }).width(width);
      text.animate({ duration: timeline.period }).cx(width / 2);
    });

    this.group.move(x, y);
  }

  getOperatorDescription(observable$: Observable<any>) {
    // @ts-ignore
    console.dir(observable$);
    let result = '';
    const operatorName = observable$.operator?.constructor?.name.replace('Operator', '');
    // @ts-ignore
    let project = observable$.operator.project.toString();
    if (project) {
      if (project.length > 10) project = '...';
      return `${operatorName}(${project})`;
    }

    // @ts-ignore
    let value = observable$.operator.value;
    if (value) {
      return `${operatorName}(${value})`;
    }

    Object.keys(observable$.operator).forEach((key) => {
      // @ts-ignore
      let value = observable$.operator[key]?.toString();
      if (value) {
        result = `${operatorName}(${key}: ${value})`;
      }
    });

    return result;
  }
}

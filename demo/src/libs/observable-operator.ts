import { G, Svg } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { RxBlockGroup } from './rx-block-group';
import { Timeline } from './timeline';

export class ObservableOperator extends RxBlockGroup {
  public static height = 40;
  public padding = 20;

  constructor(draw: Svg | G, observable$: Observable<any>, timeline: Timeline) {
    super(draw, 'observable-operator');

    const description = this.getOperatorDescription(observable$);

    const text = this.group.text(description);

    const rect = this.group
      .rect(text.rbox().width + this.padding * 2, ObservableOperator.height)
      .stroke({ color: 'black', width: 1 })
      .fill('transparent');
    text.cy(ObservableOperator.height / 2);

    timeline.time$.subscribe(() => {
      // @ts-ignore
      const width = Math.max(text.rbox().width, this.group.parent().width());
      rect.animate({ duration: timeline.period }).width(width);
      text.animate({ duration: timeline.period }).cx(width / 2);
    });
  }

  getOperatorDescription(observable$: Observable<any>) {
    // @ts-ignore
    console.dir(observable$);
    let result = '';
    const operatorName = observable$.operator?.constructor?.name.replace('Operator', '');
    // @ts-ignore
    let project = observable$.operator.project;
    if (project) {
      project = project.toString();
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

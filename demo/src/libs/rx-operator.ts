import { G, Svg } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { RxDrawer } from './rx-drawer';
import { Timeline } from './timeline';

export class RxOperator extends RxDrawer {
  public static height = 40;
  public padding = 20;
  public subscription: Subscription = new Subscription();

  private get cy() {
    return RxOperator.height / 2;
  }

  constructor(draw: Svg | G, observable$: Observable<any>, timeline: Timeline) {
    super(draw, 'observable-operator');

    const description = this._getOperatorDescription(observable$);

    const text = this.group.text(description);

    const rect = this.group
      .rect(text.rbox().width, RxOperator.height)
      .stroke({ color: 'black', width: 1 })
      .fill('transparent');

    text.cy(this.cy);

    const timelineSubscription = timeline.time$.subscribe(() => {
      // @ts-ignore
      const width = Math.max(text.rbox().width, this.group.parent().width());
      rect.animate({ duration: timeline.period, ease: '=' }).width(width);
      text.animate({ duration: timeline.period, ease: '=' }).cx(width / 2);
    });

    this.subscription.add(timelineSubscription);
  }

  private _getOperatorDescription(observable$: Observable<any>) {
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

  destroy() {
    this.subscription.unsubscribe();
  }
}

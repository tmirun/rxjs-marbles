import { G, Rect, Svg, Text } from '@svgdotjs/svg.js';
import { Observable, Subscription } from 'rxjs';
import { RxDrawer, RxDrawerOptions } from './rx-drawer';
import { Timeline } from './timeline';
import { delay, last, takeUntil } from 'rxjs/operators';

export class RxOperator extends RxDrawer {
  public static height = 40;
  public padding = 20;
  public subscription: Subscription = new Subscription();

  private _text: Text;
  private _rect: Rect;
  private _timeline: Timeline;
  private _borderRadius = 10;

  private get cy() {
    return RxOperator.height / 2;
  }

  /**
   * @param draw: Svg or G element
   * @param observable$: this is operator observable
   * @param source$: this is the observable original
   * @param timeline
   * @param options
   */
  constructor(
    draw: Svg | G,
    observable$: Observable<any>,
    source$: Observable<any>,
    timeline: Timeline,
    options?: RxDrawerOptions
  ) {
    super(draw, 'observable-operator', options);

    const description = this._getOperatorDescription(observable$);
    this._text = this.group.text(description);
    this._timeline = timeline;

    this._rect = this.group
      .rect(this._text.rbox().width, RxOperator.height)
      .stroke({ color: 'black', width: 1 })
      .attr('rx', this._borderRadius)
      .attr('ry', this._borderRadius)
      .fill('transparent');

    this._text.cy(this.cy);

    const timelineSubscription = timeline.time$.subscribe(() => {
      this._refreshWidth();
    });
    this.subscription.add(timelineSubscription);

    const sourceSubscription = observable$
      .pipe(takeUntil(source$.pipe(last(), delay(0)))) // stop with source observable
      .subscribe({
        complete: () => {
          setTimeout(() => {
            // need time out for waiting render and get correct with
            this._refreshWidth();
          });
          this.destroy();
        }
      });
    this.subscription.add(sourceSubscription);
  }

  private _refreshWidth() {
    //@ts-ignore
    const width = Math.max(this._text.rbox().width, this.group.parent().width());
    this._rect.animate({ duration: this._timeline.period, ease: '=' }).width(width);
    this._text.animate({ duration: this._timeline.period, ease: '=' }).cx(width / 2);
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

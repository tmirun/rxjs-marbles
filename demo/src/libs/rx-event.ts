export const RX_EVENT_FROM_Y = 'rxFrom';

export function throwFromEvent(y: number) {
  const newFromEvent = new CustomEvent(RX_EVENT_FROM_Y, {
    detail: y
  });
  window.dispatchEvent(newFromEvent);
}

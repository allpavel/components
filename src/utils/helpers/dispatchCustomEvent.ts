import { flushSync } from "react-dom";

export function dispatchCustomEvent<E extends CustomEvent>(target: E["target"], event: E) {
  if (target) {
    return flushSync(() => target.dispatchEvent(event));
  }
}

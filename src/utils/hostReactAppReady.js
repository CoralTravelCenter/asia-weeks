export async function hostReactAppReady(
  selector = "#__next > div",
  interval = 300,
  maxWait = 10000,
  signal,
) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    let timerId;

    const finish = (isReady) => {
      clearTimeout(timerId);
      signal?.removeEventListener('abort', onAbort);
      resolve(isReady);
    };

    const onAbort = () => finish(false);

    const waiter = () => {
      if (signal?.aborted) {
        finish(false);
        return;
      }

      const hostElement = document.querySelector(selector);

      if (hostElement?.getBoundingClientRect().height) {
        finish(true);
      } else if (Date.now() - startedAt >= maxWait) {
        finish(false);
      } else {
        timerId = setTimeout(waiter, interval);
      }
    };

    signal?.addEventListener('abort', onAbort, {once: true});
    waiter();
  });
}

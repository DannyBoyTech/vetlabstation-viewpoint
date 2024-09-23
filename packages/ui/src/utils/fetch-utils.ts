interface TFetchRequestInit extends Omit<RequestInit, "signal"> {
  timeoutMillis?: number;
  throwNotOk?: boolean;
}

/**
 * Custom fetch that provides some conveniences that standard fetch does not:
 *
 *  timeoutMillis: request timeout, fails request if doesn't finish in this time
 *  throwNotOk: (default true) if the request is not 'ok' throw an exception
 *
 * @param input
 * @param init
 * @returns response
 */
async function _fetch(input: URL | RequestInfo, init?: TFetchRequestInit) {
  const { throwNotOk = true, timeoutMillis, ...stdInit } = init ?? {};

  const reqCtrl = new AbortController();

  let timeout;
  if (timeoutMillis) {
    timeout = setTimeout(() => reqCtrl.abort(), timeoutMillis);
  }

  try {
    const res = await fetch(input, { ...stdInit, signal: reqCtrl.signal });
    if (!throwNotOk || res.ok) {
      return res;
    }
    throw new Error(res.statusText);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export type { TFetchRequestInit };
export { _fetch as fetch };

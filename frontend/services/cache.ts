// Cache simples em memória (por sessão da página) com TTL e deduplicação
// de chamadas concorrentes. Evita requests repetidos entre componentes e
// também as chamadas em pares do React.StrictMode (dev).

interface Entry {
  expires: number;
  promise: Promise<unknown>;
}

const store = new Map<string, Entry>();

/**
 * Retorna o valor em cache se ainda válido; senão executa o fetcher.
 * Guarda a Promise (não só o valor) para deduplicar chamadas simultâneas.
 */
export function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.promise as Promise<T>;
  }
  // Em erro, remove a entrada para permitir nova tentativa.
  const promise = fetcher().catch((err) => {
    store.delete(key);
    throw err;
  });
  store.set(key, { promise, expires: Date.now() + ttlMs });
  return promise as Promise<T>;
}

/** Invalida uma chave específica, ou todo o cache se nenhuma for passada. */
export function invalidate(...keys: string[]) {
  if (keys.length === 0) {
    store.clear();
    return;
  }
  keys.forEach((k) => store.delete(k));
}

// Chaves usadas pela aplicação (evita typos).
export const CacheKeys = {
  votes: 'votes',
  results: 'results',
  winners: 'winners',
  config: 'config',
  categories: 'categories',
} as const;

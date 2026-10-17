"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "error" | "ready";

/**
 * Executa `load` sempre que `deps` mudar. `load === null` => "idle".
 * Mantém `data` anterior durante um novo "loading" e descarta respostas
 * obsoletas (contador de requisição).
 */
export function useAsyncData<T>(
  load: (() => Promise<T>) | null,
  deps: React.DependencyList,
): { data: T | undefined; status: AsyncStatus; retry: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<AsyncStatus>(load ? "loading" : "idle");
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const id = ++requestId.current;
    const fn = loadRef.current;
    if (!fn) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    fn().then(
      (result) => {
        if (id !== requestId.current) return;
        setData(result);
        setStatus("ready");
      },
      () => {
        if (id !== requestId.current) return;
        setStatus("error");
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { data, status, retry };
}

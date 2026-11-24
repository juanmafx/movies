import { useCallback, useEffect, useState } from "react";

export type AsyncLoader<T> = (signal: AbortSignal) => Promise<T>;

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

type SettledState<T> = {
  load: AsyncLoader<T>;
  attempt: number;
  state: AsyncState<T>;
};

export function useAsyncResource<T>(load: AsyncLoader<T>): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<SettledState<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const settle = (state: AsyncState<T>) => {
      if (!controller.signal.aborted) {
        setSettled({ load, attempt, state });
      }
    };

    load(controller.signal).then(
      (data) => settle({ status: "success", data }),
      (error: unknown) => settle({ status: "error", error }),
    );

    return () => controller.abort();
  }, [load, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const isCurrent = settled?.load === load && settled.attempt === attempt;

  return { ...(isCurrent ? settled.state : { status: "loading" }), retry };
}

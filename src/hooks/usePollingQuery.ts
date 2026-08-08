"use client";

import { useEffect, useRef } from "react";

type PollingResult<T> =
  | { status: "success"; data: T }
  | { status: "access-denied" }
  | { status: "error" };

type PollingOptions<T> = {
  url: string;
  intervalMs: number;
  onData: (data: T) => void;
  onAccessDenied?: () => void;
};

async function requestJson<T>(url: string): Promise<PollingResult<T>> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.status === 401 || response.status === 403) return { status: "access-denied" };
    if (!response.ok) return { status: "error" };
    return { status: "success", data: await response.json() as T };
  } catch {
    return { status: "error" };
  }
}

export function usePollingQuery<T>({ url, intervalMs, onData, onAccessDenied }: PollingOptions<T>) {
  const onDataRef = useRef(onData);
  const onAccessDeniedRef = useRef(onAccessDenied);

  useEffect(() => { onDataRef.current = onData; }, [onData]);
  useEffect(() => { onAccessDeniedRef.current = onAccessDenied; }, [onAccessDenied]);

  useEffect(() => {
    let active = true;
    let polling = false;

    const poll = async () => {
      if (!active || polling || document.visibilityState !== "visible") return;
      polling = true;
      const result = await requestJson<T>(url);
      polling = false;

      if (!active) return;
      if (result.status === "success") onDataRef.current(result.data);
      else if (result.status === "access-denied") onAccessDeniedRef.current?.();
    };

    void poll();
    const timer = window.setInterval(() => void poll(), intervalMs);
    const handleVisibilityChange = () => { if (document.visibilityState === "visible") void poll(); };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs, url]);
}

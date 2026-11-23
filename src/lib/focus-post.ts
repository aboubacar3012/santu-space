import { useSyncExternalStore } from "react";

export type FocusRequest = { postId: string; openComments: boolean; token: number };

let current: FocusRequest | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const focusPost = {
  request(postId: string, openComments: boolean) {
    current = { postId, openComments, token: Date.now() };
    notify();
  },
  clear() {
    if (!current) return;
    current = null;
    notify();
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFocusRequest() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

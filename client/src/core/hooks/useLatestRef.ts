import { useRef } from "react";

/** Keeps a ref synced with the latest value without an extra effect per dependency. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  // eslint-disable-next-line react-hooks/refs -- intentional: sync ref during render is the useLatestRef pattern
  ref.current = value;
  return ref;
}

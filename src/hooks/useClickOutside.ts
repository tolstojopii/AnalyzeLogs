import { type RefObject, useEffect } from "react";

export function useClickOutside(
  isActive: boolean,
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!isActive) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      onOutside();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isActive, onOutside]);
}

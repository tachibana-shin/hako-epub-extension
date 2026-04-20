export function $$<T extends Element>(
  selector: string,
  start: Element | Document | void | null = document
): ArrayLike<T> {
  if (!start) return []
  return start.querySelectorAll<T>(selector)
}

export function $<T extends Element>(
  selector: string,
  start: Element | Document | void | null = document
): T | null {
  return start?.querySelector(selector) ?? null
}

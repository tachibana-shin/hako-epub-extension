export function containsAll<T extends Element>(
  selector: string | ArrayLike<T>,
  text: string
): T[] {
  if (typeof selector === "string") {
    selector = document.querySelectorAll(selector)
  }

  return Array.from(selector).filter((element) =>
    element.textContent?.toLowerCase().includes(text.toLowerCase())
  )
}

export function contains<T extends Element>(
  selector: string | ArrayLike<T>,
  text: string
): T | undefined {
  if (typeof selector === "string") {
    selector = document.querySelectorAll(selector)
  }

  return Array.from(selector).find((element) =>
    element.textContent?.toLowerCase().includes(text.toLowerCase())
  )
}

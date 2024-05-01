export function titlecase(s: string): string {
  // I hate that this works in all edge cases, but it does, since both do not throw any type errors
  return s.charAt(0).toUpperCase() + s.slice(1)
}

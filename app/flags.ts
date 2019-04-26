export function isEnabled(flag: string): boolean {
  return window.localStorage && localStorage[flag + 'Enabled'];
}

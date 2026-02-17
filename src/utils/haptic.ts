export function haptic(style: 'light' | 'medium' = 'light') {
  if ('vibrate' in navigator) {
    navigator.vibrate(style === 'light' ? 10 : 25);
  }
}

export function formatDuration(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainingSeconds = clamped % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

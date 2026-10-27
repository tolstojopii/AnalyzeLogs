export function formatTime(timestamp: number): string{
  const d = new Date(timestamp)
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}.${ms}`;
}
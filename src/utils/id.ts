let counter = 0;

/** React Native–safe unique id (no crypto global required). */
export function createId(): string {
  counter += 1;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const seq = counter.toString(36);
  return `${time}-${seq}-${rand}`;
}

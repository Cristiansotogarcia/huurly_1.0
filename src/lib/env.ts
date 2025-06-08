export function getEnv(key: string): string | undefined {
  const maybeMeta = typeof import.meta !== 'undefined' ? (import.meta as any) : undefined;
  if (maybeMeta && maybeMeta.env && typeof maybeMeta.env[key] !== 'undefined') {
    return maybeMeta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] !== 'undefined') {
    return process.env[key];
  }
  return undefined;
}

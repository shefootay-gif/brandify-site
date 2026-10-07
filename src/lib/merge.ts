type Plain = Record<string, unknown>;

const isPlain = (v: unknown): v is Plain =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Merge stored CMS data over defaults: objects merge recursively, arrays and
 * primitives from `stored` replace the default. Keys missing in storage (e.g.
 * added in a later release) fall back to defaults.
 */
export function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlain(defaults) || !isPlain(stored)) {
    return (stored === undefined || stored === null ? defaults : stored) as T;
  }
  const out: Plain = { ...defaults };
  for (const [key, value] of Object.entries(stored)) {
    if (!(key in defaults)) continue;
    out[key] = mergeDefaults((defaults as Plain)[key], value);
  }
  return out as T;
}

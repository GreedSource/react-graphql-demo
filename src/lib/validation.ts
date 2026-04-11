export function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

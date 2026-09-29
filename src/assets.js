// Vite resolves these to hashed URLs at build time.
const camelModules = import.meta.glob('./assets/images/camels/camel-*.png', {
  eager: true,
  import: 'default',
});

/** Camel sprite URLs ordered camel-1 … camel-8, matching COLORS. */
export const CAMEL_IMAGES = Object.keys(camelModules)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((key) => camelModules[key]);

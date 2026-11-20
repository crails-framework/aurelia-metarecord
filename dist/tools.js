export function extend(target, ...sources) {
  if (target) {
    sources = sources.filter(source => source != null);
    sources.forEach(source => {
      for (const key of Object.keys(source)) target[key] = source[key];
    });
  }
  return target;
}
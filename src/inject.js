export function inject(target, klass) {
  const properties = Object.getOwnPropertyNames(klass.prototype);
  
  properties.forEach(name => {
    if (name != "constructor") {
      target[name] = klass.prototype[name];
    }
  });
}

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inject = inject;
function inject(target, klass) {
  var properties = Object.getOwnPropertyNames(klass.prototype);

  properties.forEach(function (name) {
    if (name != "constructor") {
      target[name] = klass.prototype[name];
    }
  });
}
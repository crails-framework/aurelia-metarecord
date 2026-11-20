import deepClone from "deep-clone";
import { inject } from "./inject.js";
function collect(object, values) {
  let array = [];
  values.forEach(function (value) {
    if (object[value] != undefined) array.push(object[value]);
  });
  return array;
}
export class Fields {
  clone() {
    let cloned = deepClone(this);
    Fields.inject(cloned);
    cloned._mapFields();
    return cloned;
  }
  mergeWith(other) {
    other.forEach(field => {
      this.push(field);
      this[field.name] = field;
    });
    return this;
  }
  select(fields) {
    let result = this.clone();
    this.forEach(field => {
      if (!fields.includes(field.name)) result = result.without(field.name);
    });
    result.sort((a, b) => {
      return fields.indexOf(a.name) - fields.indexOf(b.name);
    });
    return result;
  }
  without(fieldName) {
    let result;
    if (fieldName.constructor == Array) result = this.filter(value => !fieldName.includes(value.name));else result = this.filter(value => value != this[fieldName]);
    Fields.inject(result);
    result._mapFields();
    return result;
  }
  _mapFields() {
    this.forEach(field => {
      this[field.name] = field;
    });
  }
}
;
Fields.inject = function (target) {
  inject(target, Fields);
};
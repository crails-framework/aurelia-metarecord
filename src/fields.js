import deepClone from "deep-clone";
import _ from "underscore";
import {inject} from "./inject";

function collect(object, values) {
  let array = [];

  values.forEach(function(value) {
    if (object[value] != undefined)
      array.push(object[value]);
  });
  return array;
}

export class Fields {
  clone() {
    let cloned = deepClone(this);

    _.extend(cloned, new Fields);
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
    var result = this.clone();

    this.forEach(field => {
      if (!_.include(fields, field.name))
        result = result.without(field.name);
    });
    result.sort((a, b) => {
      return fields.indexOf(a.name) - fields.indexOf(b.name);
    });
    return result;
  }

  without(fieldName) {
    var result;

    if (fieldName.constructor == Array)
      result = _.without(this, ...(collect(this, fieldName)));
    else
      result = _.without(this, this[fieldName]);
    result = _.extend(result, new Fields);
    result._mapFields();
    return result;
  }

  _mapFields() {
    this.forEach(field => {
      this[field.name] = field;
    });
  }
};

Fields.inject = function(target) {
  inject(target, Fields);
}

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fields = undefined;

var _deepClone = require("deep-clone");

var _deepClone2 = _interopRequireDefault(_deepClone);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function collect(object, values) {
  let array = [];
  values.forEach(function (value) {
    if (object[value] != undefined) array.push(object[value]);
  });
  return array;
}

class Fields {
  clone() {
    let cloned = (0, _deepClone2.default)(this);

    _underscore2.default.extend(cloned, new Fields());

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
      if (!_underscore2.default.include(fields, field.name)) result = result.without(field.name);
    });
    result.sort((a, b) => {
      return fields.indexOf(a.name) - fields.indexOf(b.name);
    });
    return result;
  }

  without(fieldName) {
    var result;
    if (fieldName.constructor == Array) result = _underscore2.default.without(this, ...collect(this, fieldName));else result = _underscore2.default.without(this, this[fieldName]);
    result = _underscore2.default.extend(result, new Fields());

    result._mapFields();

    return result;
  }

  _mapFields() {
    this.forEach(field => {
      this[field.name] = field;
    });
  }

}

exports.Fields = Fields;
;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = undefined;

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Model {
  constructor(attrs) {
    this.id = 0;
    this.attributes = {};
  }

  clone() {
    const model = new this.constructor();

    _underscore2.default.extend(model, this);

    model.attributes = _underscore2.default.clone(this.attributes);

    _underscore2.default.keys(model.attributes).forEach(key => {
      if (model.attributes[key] && model.attributes[key].constructor == Array) model.attributes[key] = model.attributes[key].slice();
    });

    return model;
  }

  get name() {
    if (this.attributes.code != undefined && this.attributes.code.length > 0) return `${this.attributes.code} - ${this.attributes.name}`;
    return this.attributes.name;
  }

  parse(object) {
    let scope = this.constructor.scope;
    var attributes;
    if (scope != undefined && object[scope] != undefined) attributes = object[scope];else attributes = object;
    this.updateAttributes(attributes);
  }

  serialize() {
    let scope = this.constructor.scope;

    if (scope != undefined) {
      var object = {};
      object[scope] = this.attributes;
      return object;
    }

    return this.attributes;
  }

  setId(value) {
    this.id = value;
  }

  updateAttributes(attributes, opts) {
    _underscore2.default.collect(_underscore2.default.keys(attributes), key => {
      const oldValue = this.attributes[key];
      if (key == 'id') this.setId(attributes.id);else this.attributes[key] = attributes[key];
      if (this[`${key}Changed`]) this[`${key}Changed`](oldValue, attributes[key]);
    });

    if (opts == undefined || opts.removeAttributes) this.removeUnexistingAttributes(attributes);
  }

  removeUnexistingAttributes(attributes) {
    _underscore2.default.collect(_underscore2.default.keys(this.attributes), key => {
      if (attributes[key] == undefined) delete this.attributes[key];
    });
  }

  copyAttributesFrom(model) {
    this.updateAttributes(model.attributes);
    return model;
  }

  subscribeToChanges(bindingEngine, callback) {
    let observers = [];
    this.constructor.fields.forEach(field => {
      const observer = bindingEngine.propertyObserver(this.attributes, field.name).subscribe(callback);
      observers.push(observer);
    });
    return observers;
  }

}

exports.Model = Model;
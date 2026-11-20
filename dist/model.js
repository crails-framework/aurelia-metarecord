import * as _ from "./tools.js";
function cloneAttributes(list) {
  list = {
    ...list
  };
  Object.keys(list).filter(key => list[key] && Array.isArray(list[key])).forEach(key => list[key] = list[key].slice());
  return list;
}
export class Model {
  constructor(attrs) {
    this.id = 0;
    this.attributes = {};
  }
  clone() {
    const model = new this.constructor();
    _.extend(model, this);
    model.attributes = cloneAttributes(this.attributes);
    return model;
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
    Object.keys(attributes).forEach(key => {
      const oldValue = this.attributes[key];
      if (key == 'id') this.setId(attributes.id);else this.attributes[key] = attributes[key];
      if (this[`${key}Changed`]) this[`${key}Changed`](oldValue, attributes[key]);
    });
    if (opts == undefined || opts.removeAttributes) this.removeUnexistingAttributes(attributes);
  }
  removeUnexistingAttributes(attributes) {
    Object.keys(this.attributes).forEach(key => {
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
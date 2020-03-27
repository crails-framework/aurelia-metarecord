import _ from "underscore";

export class Model {
  constructor(attrs) {
    this.id = 0;
    this.attributes = {};
  }

  clone() {
    const model = new this.constructor;

    _.extend(model, this);
    model.attributes = _.clone(this.attributes);
    _.keys(model.attributes).forEach(key => {
      if (model.attributes[key] && model.attributes[key].constructor == Array)
        model.attributes[key] = model.attributes[key].slice();
    });
    return model;
  }

  get name() {
    if (this.attributes.code != undefined && this.attributes.code.length > 0)
      return `${this.attributes.code} - ${this.attributes.name}`;
    return this.attributes.name;
  }

  parse(object) {
    let scope = this.constructor.scope;
    var attributes;

    if (scope != undefined && object[scope] != undefined)
      attributes = object[scope];
    else
      attributes = object;
    this.updateAttributes(attributes);
  }

  serialize() {
    let scope = this.constructor.scope;

    if (scope != undefined)
    {
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
    _.collect(_.keys(attributes), (key) => {
      const oldValue = this.attributes[key];

      if (key == 'id')
        this.setId(attributes.id);
      else
        this.attributes[key] = attributes[key];
      if (this[`${key}Changed`])
        this[`${key}Changed`](oldValue, attributes[key]);
    });
    if (opts == undefined || opts.removeAttributes)
      this.removeUnexistingAttributes(attributes);
  }

  removeUnexistingAttributes(attributes) {
    _.collect(_.keys(this.attributes), (key) => {
      if (attributes[key] == undefined)
        delete this.attributes[key];
    });
  }

  copyAttributesFrom(model) {
    this.updateAttributes(model.attributes);
    return model;
  }

  subscribeToChanges(bindingEngine, callback) {
    let observers = [];

    this.constructor.fields.forEach(field => {
      const observer = bindingEngine.propertyObserver(this.attributes, field.name)
        .subscribe(callback);

      observers.push(observer);
    });
    return observers;
  }
}

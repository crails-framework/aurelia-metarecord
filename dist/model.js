"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Model = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = exports.Model = function () {
  function Model(attrs) {
    _classCallCheck(this, Model);

    this.id = 0;
    this.attributes = {};
  }

  _createClass(Model, [{
    key: "clone",
    value: function clone() {
      var model = new this.constructor();

      _underscore2.default.extend(model, this);
      model.attributes = _underscore2.default.clone(this.attributes);
      _underscore2.default.keys(model.attributes).forEach(function (key) {
        if (model.attributes[key] && model.attributes[key].constructor == Array) model.attributes[key] = model.attributes[key].slice();
      });
      return model;
    }
  }, {
    key: "parse",
    value: function parse(object) {
      var scope = this.constructor.scope;
      var attributes;

      if (scope != undefined && object[scope] != undefined) attributes = object[scope];else attributes = object;
      this.updateAttributes(attributes);
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var scope = this.constructor.scope;

      if (scope != undefined) {
        var object = {};

        object[scope] = this.attributes;
        return object;
      }
      return this.attributes;
    }
  }, {
    key: "setId",
    value: function setId(value) {
      this.id = value;
    }
  }, {
    key: "updateAttributes",
    value: function updateAttributes(attributes, opts) {
      var _this = this;

      _underscore2.default.collect(_underscore2.default.keys(attributes), function (key) {
        var oldValue = _this.attributes[key];

        if (key == 'id') _this.setId(attributes.id);else _this.attributes[key] = attributes[key];
        if (_this[key + "Changed"]) _this[key + "Changed"](oldValue, attributes[key]);
      });
      if (opts == undefined || opts.removeAttributes) this.removeUnexistingAttributes(attributes);
    }
  }, {
    key: "removeUnexistingAttributes",
    value: function removeUnexistingAttributes(attributes) {
      var _this2 = this;

      _underscore2.default.collect(_underscore2.default.keys(this.attributes), function (key) {
        if (attributes[key] == undefined) delete _this2.attributes[key];
      });
    }
  }, {
    key: "copyAttributesFrom",
    value: function copyAttributesFrom(model) {
      this.updateAttributes(model.attributes);
      return model;
    }
  }, {
    key: "subscribeToChanges",
    value: function subscribeToChanges(bindingEngine, callback) {
      var _this3 = this;

      var observers = [];

      this.constructor.fields.forEach(function (field) {
        var observer = bindingEngine.propertyObserver(_this3.attributes, field.name).subscribe(callback);

        observers.push(observer);
      });
      return observers;
    }
  }]);

  return Model;
}();
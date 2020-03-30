define(["exports", "deep-clone", "underscore"], function (exports, _deepClone, _underscore) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Fields = undefined;

  var _deepClone2 = _interopRequireDefault(_deepClone);

  var _underscore2 = _interopRequireDefault(_underscore);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function collect(object, values) {
    var array = [];

    values.forEach(function (value) {
      if (object[value] != undefined) array.push(object[value]);
    });
    return array;
  }

  var Fields = exports.Fields = function () {
    function Fields() {
      _classCallCheck(this, Fields);
    }

    _createClass(Fields, [{
      key: "clone",
      value: function clone() {
        var cloned = (0, _deepClone2.default)(this);

        _underscore2.default.extend(cloned, new Fields());
        cloned._mapFields();
        return cloned;
      }
    }, {
      key: "mergeWith",
      value: function mergeWith(other) {
        var _this = this;

        other.forEach(function (field) {
          _this.push(field);
          _this[field.name] = field;
        });
        return this;
      }
    }, {
      key: "select",
      value: function select(fields) {
        var result = this.clone();

        this.forEach(function (field) {
          if (!_underscore2.default.include(fields, field.name)) result = result.without(field.name);
        });
        result.sort(function (a, b) {
          return fields.indexOf(a.name) - fields.indexOf(b.name);
        });
        return result;
      }
    }, {
      key: "without",
      value: function without(fieldName) {
        var result;

        if (fieldName.constructor == Array) result = _underscore2.default.without.apply(_underscore2.default, [this].concat(_toConsumableArray(collect(this, fieldName))));else result = _underscore2.default.without(this, this[fieldName]);
        result = _underscore2.default.extend(result, new Fields());
        result._mapFields();
        return result;
      }
    }, {
      key: "_mapFields",
      value: function _mapFields() {
        var _this2 = this;

        this.forEach(function (field) {
          _this2[field.name] = field;
        });
      }
    }]);

    return Fields;
  }();

  ;
});
define(["exports", "underscore"], function (exports, _underscore) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Model = undefined;

  var _underscore2 = _interopRequireDefault(_underscore);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

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
    }, {
      key: "name",
      get: function get() {
        if (this.attributes.code != undefined && this.attributes.code.length > 0) return this.attributes.code + " - " + this.attributes.name;
        return this.attributes.name;
      }
    }]);

    return Model;
  }();
});
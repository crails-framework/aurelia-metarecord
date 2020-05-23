"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fields = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _deepClone = require("deep-clone");

var _deepClone2 = _interopRequireDefault(_deepClone);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _inject = require("./inject");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

      Fields.inject(cloned);
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
      Fields.inject(result);
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

Fields.inject = function (target) {
  (0, _inject.inject)(target, Fields);
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PagedCollection = exports.Collection = exports.Model = exports.Fields = undefined;

var _fields = require("./fields");

var FieldsModule = _interopRequireWildcard(_fields);

var _model = require("./model");

var ModelModule = _interopRequireWildcard(_model);

var _collection = require("./collection");

var CollectionModule = _interopRequireWildcard(_collection);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Fields = exports.Fields = FieldsModule.Fields;
var Model = exports.Model = ModelModule.Model;
var Collection = exports.Collection = CollectionModule.Collection;
var PagedCollection = exports.PagedCollection = CollectionModule.PagedCollection;
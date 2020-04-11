"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PagedCollection = exports.Collection = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pluralize = require("pluralize");

var _pluralize2 = _interopRequireDefault(_pluralize);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collection = exports.Collection = function () {
  function Collection(http) {
    _classCallCheck(this, Collection);

    this.http = http;
    this.models = [];
  }

  _createClass(Collection, [{
    key: "get",
    value: function get(id) {
      for (var i = 0; i < this.models.length; ++i) {
        if (this.models[i].id == id) return this.models[i];
      }
      return null;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.models.splice(0);
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.http.fetch(this.url, options).then(function (response) {
        return response.json().then(function (data) {
          return _this.parse(data, options);
        }).catch(function (error) {
          console.error("JsonParseError", error);
          throw error;
        });
      });
    }
  }, {
    key: "parse",
    value: function parse(data) {
      var _this2 = this,
          _models;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var list = !data || _underscore2.default.isArray(data) ? data : data[this.scope];
      var results = [];

      if (list) {
        list.forEach(function (rawModel) {
          var model = new _this2.Model();

          model.parse(rawModel);
          results.push(model);
        });
      } else console.warn("parse called, but there was nothing to parse in", data);
      if (options.appender) options.appender(results);else (_models = this.models).splice.apply(_models, [this.models.length, 0].concat(results));
      return results;
    }
  }, {
    key: "scope",
    get: function get() {
      return (0, _pluralize2.default)(this.Model.scope);
    }
  }]);

  return Collection;
}();

var PagedCollection = exports.PagedCollection = function (_Collection) {
  _inherits(PagedCollection, _Collection);

  function PagedCollection(http) {
    _classCallCheck(this, PagedCollection);

    var _this3 = _possibleConstructorReturn(this, (PagedCollection.__proto__ || Object.getPrototypeOf(PagedCollection)).call(this, http));

    _this3.itemsCount = null;
    _this3.itemsPerPage = 10;
    _this3.pageFetched = [];
    _this3.paginateScope = "paginate";
    return _this3;
  }

  _createClass(PagedCollection, [{
    key: "clear",
    value: function clear() {
      _get(PagedCollection.prototype.__proto__ || Object.getPrototypeOf(PagedCollection.prototype), "clear", this).call(this);
      this.itemsCount = null;
      this.pageFetched.splice(0);
    }
  }, {
    key: "itemOffsetForPage",
    value: function itemOffsetForPage(position) {
      var filter = function filter(i) {
        return i < position;
      };

      return _underscore2.default.select(this.pageFetched, filter).length * this.itemsPerPage;
    }
  }, {
    key: "page",
    value: function page(position) {
      var page = [];

      if (this.pageFetched.indexOf(position) >= 0) {
        var offset = this.itemOffsetForPage(position);
        var max = Math.min(offset + this.itemsPerPage, this.models.length);

        for (var i = offset; i < max; ++i) {
          page.push(this.models[i]);
        }
      }
      return page;
    }
  }, {
    key: "fetchPage",
    value: function fetchPage(position) {
      var _this4 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.haveAllPagesBeenFetched || this.pageFetched.indexOf(position) >= 0) return new Promise(function (resolve) {
        resolve(_this4.page(position));
      });
      return this.fetch(_underscore2.default.extend({ page: position, itemsPerPage: this.itemsPerPage }, options));
    }
  }, {
    key: "_paginatedAppender",
    value: function _paginatedAppender(page, results) {
      var _models2;

      var offset = this.itemOffsetForPage(page);

      (_models2 = this.models).splice.apply(_models2, [offset, 0].concat(_toConsumableArray(results)));
    }
  }, {
    key: "parse",
    value: function parse(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var appender = this._paginatedAppender.bind(this, options.page);
      var pageOptions = options.page != undefined ? _underscore2.default.extend({ appender: appender }, options) : options;
      var results = _get(PagedCollection.prototype.__proto__ || Object.getPrototypeOf(PagedCollection.prototype), "parse", this).call(this, data, pageOptions);

      this.parsePaginationData(data);
      return results;
    }
  }, {
    key: "parsePaginationData",
    value: function parsePaginationData(data) {
      var paginateData = data["paginate"];

      if (paginateData) {
        this.itemsCount = paginateData.count;
        if (this.pageFetched.indexOf(paginateData.page) < 0) this.pageFetched.push(paginateData.page);
      }
    }
  }, {
    key: "pageCount",
    get: function get() {
      return this.itemsCount === null ? 1 : Math.ceil(this.itemsCount / this.itemsPerPage);
    }
  }, {
    key: "haveAllPagesBeenFetched",
    get: function get() {
      return this.itemsCount == this.models.length;
    }
  }]);

  return PagedCollection;
}(Collection);
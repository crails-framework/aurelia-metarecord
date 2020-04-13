import pluralize from "pluralize";
import _ from "underscore";

export class Collection {
  constructor(http) {
    this.http = http;
    this.models = [];
  }

  get scope() {
    return pluralize(this.Model.scope);
  }

  get(id) {
    for (var i = 0 ; i < this.models.length ; ++i) {
      if (this.models[i].id == id)
        return this.models[i];
    }
    return null;
  }

  clear() {
    this.models.splice(0);
  }

  fetch(options = {}) {
    return this.http.fetch(this.url, options).then(response => {
      return response.json().then(data => {
        return this.parse(data, options);
      }).catch(error => {
        console.error("JsonParseError", error);
        throw error;
      });
    });
  }

  fetchOne(id, options = {}) {
    return this.http.fetch(`${this.url}/${id}`, options).then(response => {
      return response.json().then(data => {
        return this.parseOne(data, options);
      }).catch(error => {
        console.error("JsonParseError", error);
        throw error;
      });
    });
  }

  parse(data, options = {}) {
    const list = !data || _.isArray(data) ? data : data[this.scope];
    const results = [];

    if (list) {
      list.forEach(rawModel => {
        const model = new this.Model;

        model.parse(rawModel);
        results.push(model);
      });
    } else
      console.warn("parse called, but there was nothing to parse in", data);
    if (options.appender)
      options.appender(results);
    else
      this.models.splice(this.models.length, 0, ...results);
    return results;
  }

  parseOne(data, options = {}) {
    const model = new this.Model;

    model.parse(data, options);
    if (options.appender)
      options.appender(model);
    else
      this.models.push(model);
    return model;
  }
}

export class PagedCollection extends Collection {
  constructor(http) {
    super(http);
    this.itemsCount    = null;
    this.itemsPerPage  = 10;
    this.pageFetched   = [];
    this.paginateScope = "paginate";
  }

  clear() {
    super.clear();
    this.itemsCount = null;
    this.pageFetched.splice(0);
  }

  get pageCount() {
    return this.itemsCount === null
      ? 1
      : Math.ceil(this.itemsCount / this.itemsPerPage);
  }

  get haveAllPagesBeenFetched() {
    return this.itemsCount == this.models.length;
  }

  itemOffsetForPage(position) {
    const filter = function(i) { return i < position; };

    return _.select(this.pageFetched, filter).length * this.itemsPerPage;
  }

  page(position) {
    const page = [];

    if (this.pageFetched.indexOf(position) >= 0) {
      const offset = this.itemOffsetForPage(position);
      const max = Math.min(offset + this.itemsPerPage, this.models.length);

      for (var i = offset ; i < max ; ++i)
        page.push(this.models[i]);
    }
    return page;
  }

  fetchPage(position, options = {}) {
    if (this.haveAllPagesBeenFetched || this.pageFetched.indexOf(position) >= 0)
      return new Promise(resolve => { resolve(this.page(position)); });
    return this.fetch(_.extend({ page: position, itemsPerPage: this.itemsPerPage }, options));
  }

  _paginatedAppender(page, results) {
    const offset = this.itemOffsetForPage(page);

    this.models.splice(offset, 0, ...results);
  }

  parse(data, options = {}) {
    const appender = this._paginatedAppender.bind(this, options.page);
    const pageOptions = options.page != undefined
      ? _.extend({ appender: appender }, options)
      : options;
    const results = super.parse(data, pageOptions);

    this.parsePaginationData(data);
    return results;
  }

  parsePaginationData(data) {
    const paginateData = data["paginate"];

    if (paginateData) {
      this.itemsCount = paginateData.count;
      if (this.pageFetched.indexOf(paginateData.page) < 0)
        this.pageFetched.push(paginateData.page);
    }
  }
}

const assert = require("assert");
const sinon = require("sinon");
const Model = require("../dist/model").Model;
const PagedCollection = require("../dist/collection").PagedCollection;

describe("PagedCollection", function() {
  var MyCollection, MyModel;

  beforeEach(function() {
    MyModel = class extends Model {};
    MyModel.scope = "thing";
    MyCollection = class extends PagedCollection {
      constructor(http) {
        super(http);
        this.Model = MyModel;
      }
    };
  });

  describe("constructor", function() {
    it("should set the http handler if it is passed as a parameter", function() {
      const handler = { fetch: function() {} };
      const collection = new MyCollection(handler);

      assert.equal(collection.http, handler);
    });
  });

  describe("clear", function() {
    it("should set the itemCount to null", function() {
      const collection = new MyCollection();
      collection.itemsCount = 42;
      collection.clear();
      assert.equal(collection.itemsCount, null);
    });

    it("should set the pageFetched index to an empty array", function() {
      const collection = new MyCollection();
      collection.pageFetched.push(1);
      collection.clear();
      assert.equal(collection.pageFetched.length, 0);
    });
  });

  describe("pageCount", function() {
    it("should return the page count based on the total number of item that can be fetched for this collection", function() {
      const collection = new MyCollection();
      collection.itemsCount = 143;
      collection.itemsPerPage = 12;
      assert.equal(collection.pageCount, 12);
    });

    it("should return 1 by default if the total number of item that can be fetched is unknown", function() {
      const collection = new MyCollection();
      assert.equal(collection.pageCount, 1);
    });
  });

  describe("itemOffsetForPage", function() {
    it("should return the offset of the first item for a given page number", function() {
      const collection = new MyCollection();
      collection.pageFetched = [1,2,3];
      collection.itemsPerPage = 15;
      assert.equal(collection.itemOffsetForPage(1), 0);
      assert.equal(collection.itemOffsetForPage(2), 15);
      assert.equal(collection.itemOffsetForPage(3), 30);
    });

    it("should properly adjust if the all the previous pages haven't been fetched yet", function() {
      const collection = new MyCollection();
      collection.pageFetched = [1,3];
      collection.itemsPerPage = 15;
      assert.equal(collection.itemOffsetForPage(3), 15);
    });
  });

  describe("page", function() {
    it("should return of subset of collection.models", function() {
      const collection = new MyCollection();
      const page1Model = { id: 1 };
      const page2Model = { id: 2 };
      for (var i = 0 ; i < collection.itemsPerPage ; ++i)
        collection.models.push(page1Model);
      for (var i = 0 ; i < collection.itemsPerPage ; ++i)
        collection.models.push(page2Model);
      collection.pageFetched = [1,2];

      const page1 = collection.page(1);
      assert.equal(page1.length, collection.itemsPerPage);
      for (var i = 0 ; i < page1.length ; ++i)
        assert.equal(page1[i], page1Model);

      const page2 = collection.page(2);
      assert.equal(page2.length, collection.itemsPerPage);
      for (var i = 0 ; i < page2.length ; ++i)
        assert.equal(page2[i], page2Model);
    });

    it("should not fail if the last page doesn't have as many item as collection.itemsPerPage", function() {
      const collection = new MyCollection();
      const page1Model = { id: 1 };
      const page2Model = { id: 2 };
      for (var i = 0 ; i < collection.itemsPerPage ; ++i)
        collection.models.push(page1Model);
      collection.models.push(page2Model);
      collection.pageFetched = [1,2];

      const page = collection.page(2);
      assert.equal(page.length, 1);
      assert.equal(page[0], page2Model);
    });

    it("should return an empty array if the requested page hasn't been fetched yet", function() {
      const collection = new MyCollection();
      const page2Model = { id: 2 };
      for (var i = 0 ; i < collection.itemsPerPage ; ++i)
        collection.models.push(page2Model);
      collection.pageFetched = [2];
      const page = collection.page(1);

      assert.equal(page.constructor, Array);
      assert.equal(page.length, 0);
    });
  });

  describe("fetchPage", function() {
    it("should call fetch with the proper pagination data", function() {
      const collection = new MyCollection();
      collection.fetch = sinon.fake();

      collection.itemsPerPage = 20;
      collection.fetchPage(1);
      assert(collection.fetch.calledWith({ page: 1, itemsPerPage: 20 }));
    });

    it("should return the requested page if it has already been fetched", function() {
      const collection = new MyCollection();
      collection.fetch = sinon.fake();
      collection.page = sinon.fake();
      collection.pageFetched = [1];

      collection.itemsPerPage = 20;
      collection.fetchPage(1);
      assert(collection.fetch.notCalled);
      assert(collection.page.calledWith(1));
    });
  });

  describe("parse", function() {
    it("should call parsePaginationData", function() {
      const collection = new MyCollection();
      const data = { things: [] };

      collection.parsePaginationData = sinon.fake();
      collection.parse(data);
      assert(collection.parsePaginationData.calledWith(data));
    });

    it("should insert the received data in collection.models according to the page's offset", function() {
      const collection = new MyCollection();
      const data = { things: [{ id: 3 }, { id: 4 }] };

      collection.itemsPerPage = 2;
      collection.models = [
        { id: 1 }, { id: 2 }, { id: 5 }, { id: 6 }
      ];
      collection.pageFetched = [1, 3];
      collection.parse(data, { page: 2 });
      assert.equal(collection.models.length, 6);
      assert.equal(collection.models[2].id, 3);
      assert.equal(collection.models[3].id, 4);
    });
  });

  describe("parsePaginationData", function() {
    it("should extract pagination data", function() {
      const collection = new MyCollection();
      const data = { things: [], paginate: { count: 24, page: 1 } };

      collection.parsePaginationData(data);
      assert.equal(collection.itemsCount, 24);
      assert.equal(collection.pageFetched.length, 1);
      assert.equal(collection.pageFetched[0], 1);
    });

    it("shouldn't change collection.pageFetched if the same page has been fetched twice", function() {
      const collection = new MyCollection();
      const data = { things: [], paginate: { count: 24, page: 1 } };

      collection.parsePaginationData(data);
      collection.parsePaginationData(data);
      assert.equal(collection.pageFetched.length, 1);
      assert.equal(collection.pageFetched[0], 1);
    });
  });
});

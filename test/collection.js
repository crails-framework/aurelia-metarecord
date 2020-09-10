const assert = require("assert");
const sinon = require("sinon");
const Model = require("../dist/model").Model;
const Collection = require("../dist/collection").Collection;

describe("Collection", function() {
  var MyCollection, MyModel;

  beforeEach(function() {
    MyModel = class extends Model {};
    MyModel.scope = "thing";
    MyCollection = class extends Collection {
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

    it("should initialize models as an empty array", function() {
      const collection = new MyCollection();

      assert.equal(collection.models.constructor, Array);
      assert.equal(collection.models.length, 0);
    });
  });

  describe("scope", function() {
    it("should return a pluralized version of the model's scope", function() {
      const collection = new MyCollection();
      assert.equal(collection.scope, "things");
    });
  });

  describe("get", function() {
    it("should return an instance of a model with the given id", function() {
      const collection = new MyCollection();
      const model = new MyModel;
      model.id = 42;
      collection.models.push(model);
      assert.equal(collection.get(42), model);
    });

    it("should return null if no instance is found having the given id", function() {
      const collection = new MyCollection();
      assert.equal(collection.get(42), null);
    });
  });

  describe("clear", function() {
    it("should empty the model's list", function() {
      const collection = new MyCollection();
      collection.models.push(new MyModel);
      collection.clear();
      assert.equal(collection.models.length, 0);
    });
  });

  describe("parse", function() {
    const testSource = {
      things: [
        { id: 1, content: "Hello world" },
        { id: 2, content: "Greetings planet" }
      ]
    };

    it("should load the model list from an object", function() {
      const collection = new MyCollection();
      collection.parse(testSource);
      assert.equal(collection.models.length, 2);
    });

    it("should load the model list from an array", function() {
      const collection = new MyCollection();
      collection.parse(testSource.things);
      assert.equal(collection.models.length, 2);
    });

    it("should load the model has instance of collection.Model", function() {
      const collection = new MyCollection();
      collection.parse(testSource);
      assert.equal(collection.models[0].constructor, MyModel);
    });

    it("should have run parse on the loaded models", function() {
      const collection = new MyCollection();
      collection.parse(testSource);
      assert.equal(collection.models[0].attributes.content, "Hello world");
    });
  });

  describe("fetch", function() {
    var responseStub = new class {
      json() {
        return new Promise(resolve => { resolve(this.data); });
      }
    };
    var httpStub = new class {
      fetch(url, options) {
        this._calledWith = { url: url, options: options };
        return new Promise(resolve => { resolve(responseStub); });
      }
    };
    var collection;

    beforeEach(function() {
      collection = new MyCollection(httpStub);
      collection.parse = sinon.fake();
    });

    it("should call http.fetch with the collection's url", function() {
      collection.url = "/things";
      collection.fetch();
      assert.equal(httpStub._calledWith.url, "/things");
    });

    it("should call collection.parse with the received data", function() {
      responseStub.data = { things: [{ id: 42, content: "Hi there" }] };
      return collection.fetch().then(() => {
        assert(collection.parse.calledOnce);
        assert(collection.parse.calledWith(responseStub.data));
      });
    });

    it("should forward the options parameter to http-fetch", function() {
      collection.fetch({ method: "post" });
      assert.equal(httpStub._calledWith.options.method, "post");
    });

    it("should initialize url parameters from options", function() {
      collection.url = "/things";
      collection.fetch({ params: { a: 42, b: 12} });
      assert.equal(httpStub._calledWith.url, "/things?a=42&b=12");
    });
  });

  describe("fetchOne", function() {
    var responseStub = new class {
      json() {
        return new Promise(resolve => { resolve(this.data); });
      }
    };
    var httpStub = new class {
      fetch(url, options) {
        this._calledWith = { url: url, options: options };
        return new Promise(resolve => { resolve(responseStub); });
      }
    };
    var collection;

    beforeEach(function() {
      collection = new MyCollection(httpStub);
      collection.url = "/things";
      collection.Model.constructor.parse = sinon.fake();
      responseStub.data = { id: "modelid", someattr: "hello model" };
    });

    it("should call http.fetch with the collection's url appended with the model's id", function() {
      collection.fetchOne("modelid");
      assert.equal(httpStub._calledWith.url, "/things/modelid");
    });

    it("should resolve the promise with the fetched model", function() {
      return collection.fetchOne("modelid").then(function (model) {
        assert.equal(model.constructor, collection.Model);
        assert.equal(model.id, "modelid");
        assert.equal(model.attributes.someattr, "hello model");
      });
    });

    it("should append the model to the collection's model list", function() {
      return collection.fetchOne("modelid").then(function (model) {
        assert.equal(collection.models.length, 1);
      });
    });

    it("should forward the options parameter to http-fetch", function() {
      collection.fetchOne("modelid", { method: "post" });
      assert.equal(httpStub._calledWith.options.method, "post");
    });

    it("should initialize url parameters from options", function() {
      collection.fetchOne(16, { params: { a: 42, b: 12} });
      assert.equal(httpStub._calledWith.url, "/things/16?a=42&b=12");
    });
  });
});


const assert = require("assert");
const Fields = require("../dist/fields").Fields;

describe("Fields", function() {
  var fields;

  beforeEach(function() {
    fields = [
      {"name":"email","type":"string","required":true},
      {"name":"is_manager","type":"bool"}
    ];
  });

  describe("inject", function() {
    it("should turn an array into a Fields object", function() {
      Fields.inject(fields);
      assert.equal(fields.clone, Fields.prototype.clone);
    });
  });

  describe("_mapFields", function() {
    it("should make each field accessible by name in the object", function() {
      Fields.inject(fields);
      fields._mapFields();
      assert.equal(fields.email, fields[0]);
    });
  });

  describe("instance methods", function() {
    beforeEach(function() {
      Fields.inject(fields);
      fields._mapFields();
    });

    describe("clone", function() {
      it("should return an object containing the same fields", function() {
        const cloned = fields.clone();

        assert.equal(cloned.length, fields.length);
        assert.equal(JSON.stringify(cloned.email), JSON.stringify(fields.email));
        assert.equal(JSON.stringify(cloned.is_manager), JSON.stringify(fields.is_manager));
      });

      it("should return a Fields object", function() {
        const cloned = fields.clone();

        assert.equal(cloned.select, Fields.prototype.select);
      });
    });

    describe("mergeWith", function() {
      it("should add the fields of the Fields parameter to the current object", function() {
        const fieldsAlt = [
          {"name":"firstname","type":"string"},
          {"name":"lastname","type":"string"}
        ];
        Fields.inject(fieldsAlt);

        fields.mergeWith(fieldsAlt);
        assert.equal(fields.length, 4);
        assert.equal(JSON.stringify(fields.firstname), JSON.stringify(fieldsAlt[0]));
      });
    });

    describe("without", function() {
      it("should return an object containing the same fields, except the one mentionned", function() {
        const clone = fields.without("is_manager");

        assert.equal(clone.length, 1);
        assert.equal(JSON.stringify(clone.email), JSON.stringify(fields.email));
        assert.equal(clone.is_manager, undefined);
      });

      it("should work as well if the parameter is an array", function() {
        const clone = fields.without(["email", "is_manager"]);

        assert.equal(clone.length, 0);
      });

      it("should return a Fields object", function() {
        const cloned = fields.without("is_manager");

        assert.equal(cloned.select, Fields.prototype.select);
      });
    });

    describe("select", function() {
      it("should return an object containing only the specified fields", function() {
        const clone = fields.select(["email"]);

        assert.equal(clone.length, 1);
        assert.equal(JSON.stringify(clone.email), JSON.stringify(fields.email));
        assert.equal(clone.is_manager, undefined);
      });

      it("should return a Fields object", function() {
        const cloned = fields.select(["is_manager"]);

        assert.equal(cloned.select, Fields.prototype.select);
      });
    });
  });
});


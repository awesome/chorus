describe("chorus.models.Database", function() {
    beforeEach(function() {
        this.model = backboneFixtures.database({ id: '2', name: "love_poems", dataSource: {id: '1', name: "insta_whip"} });
    });

    describe("#urlTemplate", function() {
        it("should have the correct show url", function() {
            expect(this.model.showUrl()).toMatchUrl("#/databases/2");
        });
    });

    describe("#dataSource", function() {
        it("returns a data source with the right id and name", function() {
            expect(this.model.dataSource().id).toEqual('1');
            expect(this.model.dataSource().name()).toEqual('insta_whip');
        });

        it("memoizes", function() {
            expect(this.model.dataSource()).toBe(this.model.dataSource());
        });
    });

    describe("#schemas", function() {
        beforeEach(function() {
            this.schemas = this.model.schemas();
        });

        it("returns a schema set with the right database id", function() {
            expect(this.schemas).toBeA(chorus.collections.SchemaSet);
            expect(this.schemas.attributes.databaseId).toBe("2");
        });

        it("memoizes", function() {
            expect(this.schemas).toBe(this.model.schemas());
        });
    });

    it("includes DataSourceCredentials mixin", function() {
        expect(this.model.dataSourceRequiringCredentials).toBeTruthy();
    });
});

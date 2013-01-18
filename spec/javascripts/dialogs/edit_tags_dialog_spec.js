describe("chorus.dialogs.EditTags", function() {
    beforeEach(function() {
        this.model1 = rspecFixtures.workfile.sql({tags: [
            {name: "tag1"},
            {name: "tag2"}
        ]});
        this.model2 = rspecFixtures.workfile.sql({tags: [
            {name: "tag1"},
            {name: "tag3"}
        ]});
        this.collection = rspecFixtures.workfileSet([
            this.model1.attributes, this.model2.attributes]);
        this.dialog = new chorus.dialogs.EditTags({collection: this.collection});
        spyOn(this.dialog, "closeModal");
        this.dialog.render();
    });

    it("has the right title", function() {
        expect(this.dialog.title).toMatchTranslation("edit_tags.title");
    });

    it("displays all the relevant tags", function() {
        var tagList = this.dialog.$('.text-label');
        expect($(tagList[0])).toContainText("tag1 (2)");
        expect($(tagList[1])).toContainText("tag2 (1)");
        expect($(tagList[2])).toContainText("tag3 (1)");
    });

    describe("clicking the close button", function(){
        beforeEach(function(){
           this.dialog.$(".cancel").click();
        });

        it("closes the dialog", function(){
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });
    });

    describe("after the dialog is revealed by facebox", function() {
        // TODO #42306281: get this working on ci
        xit("focus moves to the tag input box", function() {
            $('#jasmine_content').append(this.dialog.el);
            this.dialog.launchModal();
            expect(this.dialog.$('.tag_editor').is(":focus")).toBeTruthy();
            this.dialog.closeModal();
            $(document).trigger("close.facebox");
        });
    });

    describe("editing tags", function() {
        beforeEach(function() {
            this.model1 = rspecFixtures.workfile.sql({
                tags: [
                    {name: "tag1"},
                    {name: "tag2"}
                ]
            });
            this.model2 = rspecFixtures.workfile.sql({
                tags: [
                    {name: "tag1"},
                    {name: "tag3"}
                ]
            });
            this.collection = rspecFixtures.workfileSet([
                this.model1.attributes,
                this.model2.attributes]);
            this.dialog = new chorus.dialogs.EditTags({collection: this.collection});
            spyOn(this.collection, "saveTags").andCallThrough();
            this.dialog.render();
        });

        it("displays all the relevant tags", function() {
            expect(this.dialog.$(".text-tags")).toContainText("tag1");
            expect(this.dialog.$(".text-tags")).toContainText("tag2");
            expect(this.dialog.$(".text-tags")).toContainText("tag3");
            expect(this.dialog.$(".text-button").length).toBe(3);
        });

        describe('when a tag is added', function() {
             beforeEach(function(){
                enterTag(this.dialog, "foo");
             });

            it('adds the tag to all the models', function() {
                this.collection.each(function(model) {
                    expect(model.tags().pluck('name')).toContain('foo');
                });
            });

            it('saves the tags', function() {
                expect(this.collection.saveTags).toHaveBeenCalled();
            });

            it('triggers model.change', function() {
                var savedModel = this.collection.last();
                spyOnEvent(savedModel, "change");
                this.server.lastCreateFor(savedModel.tags()).succeed();
                expect("change").toHaveBeenTriggeredOn(savedModel);
            });

            it('adds the new tag to the end and updates the count', function(){
                expect(this.dialog.tags().last().get('name')).toEqual('foo');
                expect(this.dialog.tags().last().get('count')).toEqual(this.collection.length);
            });

            context('when the tag is already on some of the models', function() {
               beforeEach(function(){
                   enterTag(this.dialog, 'tag2');
               });

                it('saves the tags', function() {
                    expect(this.collection.saveTags).toHaveBeenCalled();
                });

                it('adds the tag to all the models', function(){
                    this.collection.each(function(model) {
                        expect(model.tags().pluck('name')).toContain('tag2');
                    });
                });

                it('adds the new tag to the end and updates the count', function(){
                    expect(this.dialog.tags().last().get('name')).toEqual('tag2');
                    expect(this.dialog.tags().last().get('count')).toEqual(this.collection.length);
                });
            });

            context('when the save fails', function(){
                beforeEach(function() {
                    var savedModel = this.collection.last();
                    spyOn(this.dialog, "showErrors");
                    this.server.lastCreateFor(savedModel.tags()).failForbidden({message: "Forbidden"});
                });

                it("shows an error message", function() {
                    expect(this.dialog.showErrors).toHaveBeenCalledWith(this.collection.last().tags());
                });
            });
        });

        describe("when a tag is removed using the x button", function() {
            beforeEach(function() {
                this.dialog.$(".text-remove:eq(0)").click();
            });

            it('removes a tag from all the models', function() {
                this.collection.each(function(model) {
                    expect(model.tags().pluck('name')).not.toContain('tag1');
                });
            });

            it('saves the tags', function(){
                expect(this.collection.saveTags).toHaveBeenCalled();
            });
        });
    });
});
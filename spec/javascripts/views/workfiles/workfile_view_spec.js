describe("chorus.views.Workfile", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.sql({ id: "24" });
        this.view = new chorus.views.Workfile({ model: this.model, activeWorkspace: true });
        this.view.render();
    });

    it("includes the data-id", function() {
        expect($(this.view.el).data("id")).toBe(24);
    });

    it("links the workfile's name to its show page", function() {
        expect(this.view.$("a.name")).toHaveText(this.model.get("fileName"));
        expect(this.view.$("a.name")).toHaveHref(this.model.showUrl());
    });

    it("includes the correct workfile icon (non-image)", function() {
        expect(this.view.$("img")).toHaveAttr("src", "/images/workfiles/icon/sql.png");
    });

    context("when the workfile is a tableau workbook link", function () {
        beforeEach(function () {
            this.model.set({fileType: 'tableau_workbook', workbookUrl: 'http://tableau/hi', workbookName: 'Hi'});
        });

        it("should show workbook details", function () {
            expect(this.view.$('.details a.tableau')).toHaveHref(this.model.get('workbookUrl'));
            expect(this.view.$('.details a.tableau')).toHaveText(this.model.get('workbookUrl'));
        });
    });

    context("when the workfile has tags", function () {
        beforeEach(function () {
            this.model.set({tags: [{name: "tag1"}, {name: "tag2"}]});
        });

        it("should show a list of tags", function () {
            expect(this.view.$('.tag_list')).toContainTranslation("tag_list.title");
            expect(this.view.$('.tag_list')).toContainText("tag1 tag2");
        });
    });

    context("when the workfile has one comment", function() {
        beforeEach(function() {
            this.model.get("recentComments")[0].timestamp = "2012-11-08T18:06:51Z";
            this.view.render();
        });

        it("includes the most recent comment body", function() {
            expect(this.view.$(".comment .body")).toContainText(this.model.lastComment().get("body"));
        });

        it("includes the full name of the most recent commenter", function() {
            expect(this.view.$(".comment .user")).toHaveText(this.model.lastComment().author().displayName());
        });

        it("does not display the 'other comments' text", function() {
            expect(this.view.$(".comment")).not.toContainText(t("workfiles.other_comments", {count: 0}));
        });

        it("displays the abbreviated date of the most recent comment", function() {
            expect(this.view.$(".comment_info .on").text().trim()).toBe("Nov 8");
        });
    });

    context("when the workfile has more than one comment", function() {
        beforeEach(function() {
            this.model.set({ commentCount: 3 });
        });

        it("displays the 'other comments' text", function() {
            expect(this.view.$(".comment")).toContainText(t("workfiles.other_comments", { count: 2 }));
        });
    });

    context("when the workfile has no comments", function() {
        beforeEach(function() {
            this.model.unset("recentComments");
        });

        it("does not display the most recent comment", function() {
            expect(this.view.$(".comment")).not.toExist();
        });
    });

    describe("when the model received an 'invalidated' trigger", function() {
        beforeEach(function() {
            spyOn(this.model, "fetch");
        });

        it("reloads the model", function() {
            this.model.trigger("invalidated");
            expect(this.model.fetch).toHaveBeenCalled();
        });
    });
});

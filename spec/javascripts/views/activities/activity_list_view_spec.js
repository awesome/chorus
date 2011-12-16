describe("chorus.views.ActivityList", function() {
    beforeEach(function() {
        fixtures.model = 'ActivitySet';
        this.collection = fixtures.modelFor('fetch');
        this.view = new chorus.views.ActivityList({collection: this.collection, additionalClass : "foo_class"});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("adds additionalClass to the top-level element", function() {
            expect($(this.view.el)).toHaveClass("foo_class");
        })

        it("renders an li for each item in the collection", function() {
            expect(this.view.$("li[data-activity-id]").length).toBe(this.collection.length);
        });

        it("displays a Comment link for each activity", function() {
            var link = this.view.$("li[data-activity-id=10000] .links a.comment.dialog");
            expect(link.data("dialog")).toBe("Comment");
            expect(link.data("entity-type")).toBe("comment");
            expect(link.data("entity-id")).toBe(10000);

            link = this.view.$("li[data-activity-id=10001] .links a.comment.dialog");
            expect(link.data("dialog")).toBe("Comment");
            expect(link.data("entity-type")).toBe("comment");
            expect(link.data("entity-id")).toBe(10001);
        })

        describe("comment rendering", function() {
            it("displays comments for each activity, if any", function() {
                expect(this.view.$("li[data-activity-id=10000] .comments")).toExist();
                expect(this.view.$("li[data-activity-id=10000] .comments li").length).toBe(2);
                expect(this.view.$("li[data-activity-id=10001] .comments")).not.toExist();
            })

            it("displays information for each comment", function() {
                expect(this.view.$("li[data-comment-id=10023] .icon a")).toHaveAttr("href", "#/users/12")
                expect(this.view.$("li[data-comment-id=10023] .icon a img")).toHaveAttr("src", "/edc/userimage/msofaer?size=icon")
                expect(this.view.$("li[data-comment-id=10023] .comment_header a")).toHaveText("Michael Sofaer");
                expect(this.view.$("li[data-comment-id=10023] .comment_content .timestamp")).toExist();
                expect(this.view.$("li[data-comment-id=10024] .icon a")).toHaveAttr("href", "#/users/13")
                expect(this.view.$("li[data-comment-id=10024] .icon a img")).toHaveAttr("src", "/edc/userimage/mrushakoff?size=icon")
                expect(this.view.$("li[data-comment-id=10024] .comment_header a")).toHaveText("Mark Rushakoff");
                expect(this.view.$("li[data-comment-id=10024] .comment_content .timestamp")).toExist();
            })

            it("displays the text of each comment", function() {
                expect(this.view.$("li[data-comment-id=10023] .comment_content .body")).toHaveText("hi there");
                expect(this.view.$("li[data-comment-id=10024] .comment_content .body")).toHaveText("hello");
            })

            it("does not initially add the 'more' class to any comment list", function() {
                expect(this.view.$("ul.comments")).not.toHaveClass("more");
            })

            context("when there are less than three comments", function() {
                it("does not render a 'more comments' link", function() {
                    expect(this.view.$("li[data-activity-id=10000] .comments a.more")).not.toExist();
                })

                it("does not apply the 'more' class to any comments", function() {
                    expect(this.view.$(".comments li.more")).not.toExist();
                })
            })
            context("when there are three or more comments", function() {
                beforeEach(function() {
                    var comments = this.collection.at(0).get("comments");
                    comments.push(comments[0]);
                    this.view.render();
                })

                it("renders a 'more comments' link", function() {
                    expect(this.view.$("li[data-activity-id=10000] .comments a.more")).toExist();
                })

                it("applies the 'more' class to trailing elements", function() {
                    expect(this.view.$(".comments li:eq(0)")).not.toHaveClass("more");
                    expect(this.view.$(".comments li:eq(1)")).not.toHaveClass("more");
                    expect(this.view.$(".comments li:eq(2)")).toHaveClass("more");
                })
            })
        })

        describe("pagination", function() {
            context("when there is no next page", function() {
                it("does not render a 'more' link", function() {
                    expect(this.view.$("a.more_activities")).not.toExist();
                })
            })

            context("when there is a next page", function() {
                beforeEach(function() {
                    this.collection.pagination.total = "4";
                    this.view.render();
                })

                it("renders a 'more' link", function() {
                    expect(this.view.$(".more_activities a")).toExist();
                })

                describe("when the 'more' link is clicked", function() {
                    it("fetches the next page of the activity stream", function() {
                        spyOn(this.collection, 'fetchPage');
                        this.view.$(".more_activities a").click();
                        expect(this.collection.fetchPage).toHaveBeenCalledWith(2, { add : true });
                    })
                })
            })
        })

    });
});
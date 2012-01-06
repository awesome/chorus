describe("chorus.alerts", function() {
    beforeEach(function() {
        this.model = new chorus.models.Base({ id: "foo"});
        this.alert = new chorus.alerts.Base({ model : this.model });
        this.alert.title = "OH HAI";
        this.alert.text = "How are you?"
        this.alert.ok = "Do it!"
    })

    describe("#render", function() {
        beforeEach(function() {
            this.alert.render()
        })

        it("displays the title", function() {
            expect(this.alert.$("h1").text()).toBe("OH HAI")
        })

        it("displays the text", function() {
            expect(this.alert.$("p").text()).toBe("How are you?")
        })

        it("displays the icon", function() {
            expect(this.alert.$("img")).toHaveAttr("src", "images/message_icon.png")
        })

        it("displays the 'ok' text on the submit button", function() {
            expect(this.alert.$("button.submit").text()).toBe("Do it!");
        })

        it("displays server errors", function() {
            this.alert.resource.set({serverErrors : [
                { message: "Hi there" }
            ]});
            this.alert.render();

            expect(this.alert.$(".errors").text()).toContain("Hi there")
        })
    })


    describe("#launchModal", function() {
        beforeEach(function() {
            spyOn($, "facebox")
            spyOn(this.alert, "render")
            spyOn(this.alert, "el")
            this.alert.launchModal()
        })

        it("creates a facebox", function() {
            expect($.facebox).toHaveBeenCalledWith(this.alert.el);
        })

        it("renders in the facebox", function() {
            expect(this.alert.render).toHaveBeenCalled();
        })
    })

    describe("Clicking the cancel button", function() {
        beforeEach(function() {
            this.alert.render();
            spyOnEvent($(document), "close.facebox");
            this.alert.$("button.cancel").click();
        })

        it("dismisses the alert", function() {
            expect("close.facebox").toHaveBeenTriggeredOn($(document))
        });
    });
})

describe("ModelDelete alert", function() {
    beforeEach(function() {
        this.model = new chorus.models.User();
        this.alert = new chorus.alerts.ModelDelete({  model: this.model });
        stubModals();
        this.alert.launchModal();
        this.alert.redirectUrl = "/partyTime"
        this.alert.text = "Are you really really sure?"
        this.alert.title = "A standard delete alert"
        this.alert.ok = "Delete It!"
    });

    describe("#revealed", function() {
        beforeEach(function() {
            spyOn($.fn, 'focus');
            this.alert.render();
        })

        it("focuses on the cancel button", function() {
            this.alert.revealed();
            expect($.fn.focus).toHaveBeenCalled();
            expect($.fn.focus.mostRecentCall.object).toBe("button.cancel");
        })
    })

    describe("clicking delete", function() {
        beforeEach(function() {
            this.alert.render();
            spyOn(this.alert.model, "destroy");
            this.alert.$("button.submit").click();
        })

        it("deletes the model", function() {
            expect(this.alert.model.destroy).toHaveBeenCalled();
        });

        describe("when the model deletion is successful", function() {
            beforeEach(function() {
                spyOn(chorus.router, "navigate");
                spyOnEvent($(document), "close.facebox");
            });

            it("dismisses the alert", function () {
                this.alert.model.trigger("destroy", this.alert.model);
                expect("close.facebox").toHaveBeenTriggeredOn($(document))
            });

            it("navigates to the redirectUrl", function() {
                this.alert.model.trigger("destroy", this.alert.model);
                expect(chorus.router.navigate).toHaveBeenCalledWith("/partyTime", true);
            });

            context("when the alert does NOT have a redirect url", function() {
                it("does not navigate", function() {
                    delete this.alert.redirectUrl;
                    this.alert.model.trigger("destroy", this.alert.model);
                    expect(chorus.router.navigate).not.toHaveBeenCalled();
                });
            });
        })

        describe("when the model deletion fails", function() {
            beforeEach(function() {
                spyOnEvent($(document), "close.facebox");
                this.alert.resource.set({serverErrors : [
                    { message: "Hi there" }
                ]});
                this.alert.model.trigger("destroyFailed", this.alert.model);
            })

            it("does not dismiss the dialog", function() {
                expect("close.facebox").not.toHaveBeenTriggeredOn($(document));
            })
        })
    })

    describe("clicking cancel", function() {
        beforeEach(function() {
            this.alert.render();
            this.alert.$("button.cancel").click();
            spyOn(chorus.router, "navigate");
            this.alert.model.trigger("destroy", this.alert.model);
        })

        it("unbinds events on the model", function() {
            expect(chorus.router.navigate).not.toHaveBeenCalled();
        })
    })
})


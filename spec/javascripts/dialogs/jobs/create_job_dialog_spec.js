describe("chorus.dialogs.CreateJob", function () {
    beforeEach(function () {
        stubDefer();
        this.jobPlan = {
            name: 'Apples',
            interval_value: '2',
            interval_unit: 'weeks',
            month: "7",
            day: "9",
            year: "3013",
            hour: '1',
            minute: '5',
            meridian: 'am'
        };
        this.workspace = backboneFixtures.workspace();
        this.dialog = new chorus.dialogs.CreateJob({workspace: this.workspace});
        this.dialog.render();
    });

    it("has all the dialog pieces", function () {
        expect(this.dialog.title).toMatchTranslation("create_job_dialog.title");
        expect(this.dialog.$('button.submit').text()).toMatchTranslation("create_job_dialog.submit");
        expect(this.dialog.$('button.cancel').text()).toMatchTranslation("actions.cancel");
    });

    context("creating a Job that runs On Demand", function () {
        beforeEach(function () {
            this.jobPlan.interval_unit = 'on_demand';
        });

        it("leaves scheduling options hidden", function () {
            expect(this.dialog.$('.interval_options')).toHaveClass('hidden');
        });

        context("with valid field values", function () {
            beforeEach(function () {
                this.dialog.$('input.name').val(this.jobPlan.name).trigger("keyup");
            });

            it("should enable the submit button", function () {
                expect(this.dialog.$('button.submit')).toBeEnabled();
            });

            describe("submitting the form", function () {
                beforeEach(function () {
                    this.dialog.$("form").submit();
                });

                it("posts the form elements to the API", function () {
                    var postUrl = this.server.lastCreateFor(this.dialog.model).url;
                    expect(postUrl).toContain("/workspaces/" + this.workspace.id + "/jobs");
                });

                it("posts with the correct values", function() {
                    var params = this.server.lastCreate().params();
                    expect(params['job[name]']).toEqual(this.jobPlan.name);
                    expect(params['job[interval_unit]']).toEqual(this.jobPlan.interval_unit);
                    expect(params['job[interval_value]']).toEqual("0");
                });

                context("when the save fails", function () {
                    beforeEach(function () {
                        this.server.lastCreateFor(this.dialog.model).failUnprocessableEntity({
                            fields: {
                                BASE: { SOME_FAKE_ERROR: {}}
                            }
                        });
                    });

                    it("should display the errors for the model", function() {
                        expect(this.dialog.$(".errors li")).toExist();
                    });
                });

                context("when the save succeeds", function () {
                    beforeEach(function () {
                        spyOn(this.dialog, "closeModal");
                        spyOn(chorus, "toast");
                        this.server.lastCreate().succeed();
                    });

                    it("it should close the modal", function () {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                    });

                    it("should create a toast", function () {
                        expect(chorus.toast).toHaveBeenCalledWith(this.dialog.message);
                    });
                });
            });
        });

        context("with invalid field values", function () {
            it("leaves the form disabled", function () {
                expect(this.dialog.$('button.submit')).toBeDisabled();
            });
        });
    });

    context("creating a Job that runs on schedule", function () {
        describe("selecting 'on schedule'", function () {
            beforeEach(function () {
                this.dialog.$('input:radio#onSchedule').prop("checked", true).trigger('change');
            });

            it("should show schedule options", function () {
                expect(this.dialog.$('.interval_options')).not.toHaveClass('hidden');
            });

            it("should have a select with hours, days, weeks, months as options", function() {
                expect(this.dialog.$(".interval_unit option[value=hours]")).toContainTranslation("job.interval_unit.hours");
                expect(this.dialog.$(".interval_unit option[value=days]")).toContainTranslation("job.interval_unit.days");
                expect(this.dialog.$(".interval_unit option[value=weeks]")).toContainTranslation("job.interval_unit.weeks");
                expect(this.dialog.$(".interval_unit option[value=months]")).toContainTranslation("job.interval_unit.months");

                expect(this.dialog.$(".interval_unit").val()).toBe("hours");
            });

            it("should show the date controls", function() {
                expect(this.dialog.$(".date_widget")).toExist();
            });
        });

        context("with valid field values", function () {
            beforeEach(function () {
                this.dialog.$('input:radio#onSchedule').prop("checked", true).trigger("change");
                var dialog = this.dialog;
                var jobPlan = this.jobPlan;
                _.each(_.keys(this.jobPlan), function (prop) {
                    var selects = ['interval_unit', 'meridian', 'hour', 'minute'];
                    var element = (_.contains(selects, prop) ? 'select.' : 'input.');
                    dialog.$(element + prop).val(jobPlan[prop]).trigger("change").trigger("keyup");
                });
            });

            it("should enable the submit button", function () {
                expect(this.dialog.$('button.submit')).toBeEnabled();
            });

            describe("submitting the form", function () {
                beforeEach(function () {
                    this.dialog.$("form").submit();
                });

                it("posts the form elements to the API", function () {
                    var postUrl = this.server.lastCreateFor(this.dialog.model).url;
                    expect(postUrl).toContain("/workspaces/" + this.workspace.id + "/jobs");
                });

                it("posts with the correct values", function() {
                    var params = this.server.lastCreate().params();
                    var date = new Date(this.jobPlan.year, parseInt(this.jobPlan.month, 10) - 1, this.jobPlan.day, this.jobPlan.hour, this.jobPlan.minute);
                    expect(params['job[name]']).toEqual(this.jobPlan.name);
                    expect(params['job[interval_unit]']).toEqual(this.jobPlan.interval_unit);
                    expect(params['job[interval_value]']).toEqual(this.jobPlan.interval_value);
                    expect(params['job[next_run]']).toEqual(date.toUTCString());
                });
            });
        });

        context("with invalid field values", function () {
            beforeEach(function () {
                this.dialog.$('input.interval_value').val('').trigger("keyup");
            });

            it("leaves the form disabled", function () {
                expect(this.dialog.$('button.submit')).toBeDisabled();
            });
        });
    });
});
chorus.views.WorkfileHeader = chorus.views.Base.extend({
    templateName: "workfile_header",
    constructorName: "WorkfileHeaderView",
    events: {
        "click .save_tags": "saveTags"
    },

    postRender: function() {
        var textarea = this.$('textarea');
        this.textext = textarea.textext({
            plugins: 'tags prompt focus autocomplete',
            tagsItems: this.model.get("tagNames"),
            prompt: t('tags.prompt')
        });

        textarea.bind('isTagAllowed', _.bind(this.validateTag, this));
        textarea.bind('setInputData', _.bind(this.restoreInvalidTag, this));
    },

    validateTag: function(e, data) {
        this.clearErrors();
        this.invalidTag = "";
        if(data.tag.length > 100) {
            data.result = false;
            this.markInputAsInvalid(this.$('textarea'), t("field_error.TOO_LONG", {field: "Tag", count : 100}), false);
            this.invalidTag = data.tag;
        }
    },

    restoreInvalidTag: function(e) {
        if (this.invalidTag) {
            this.$('textarea').val(this.invalidTag);
            this.invalidTag = "";
        }
    },

    additionalContext: function() {
        return {
            iconUrl: this.model.iconUrl()
        };
    },


    saveTags: function(e) {
        e.preventDefault();
        var tagNames = JSON.parse(this.$('input[type=hidden]').val());

        $.post('/taggings', {
            entity_id: this.model.id,
            entity_type: 'workfile',
            tag_names: tagNames
        });
    }
});

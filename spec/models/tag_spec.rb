require 'spec_helper'

describe Tag do
  describe "polymorphicism" do
    it "can belong to multiple types" do
      table = FactoryGirl.create(:gpdb_table)
      table.tags << Tag.new(:name => "fancy tag")
      table.reload.tags.last.name.should == "fancy tag"

      view = FactoryGirl.create(:gpdb_view)
      view.tags << Tag.new(:name => "different tag")
      view.reload.tags.last.name.should == "different tag"
    end
  end

  describe "search fields" do
    it "indexes the tag name" do
      Tag.should have_searchable_field :name
    end
  end

  describe "#named_like" do
    it "returns tags based on substring match" do
      Tag.create!(:name => "abc")
      Tag.create!(:name => "ABD")
      Tag.create!(:name => "abe")
      Tag.create!(:name => "xyz")

      matching_tags = Tag.named_like("ab")

      matching_tags.map(&:name).should =~ ["abc", "ABD", "abe"]
    end

    it "is not vulnerable to sql injection" do
      Tag.named_like("'drop tables").to_sql.should match /\(name ILIKE '%''drop tables%'\)/
    end
  end

  describe "counter cache" do
    let(:tag) { Tag.create!(:name => "foobar") }
    let(:model_1) { workfiles(:public) }
    let(:model_2) { workspaces(:public) }

    it "knows how many taggings it has" do
      expect do
        model_1.tags << tag
        model_2.tags << tag
      end.to change { tag.reload.taggings_count }.by(2)
    end

    it "resets the tag count" do
      model_1.tags << tag
      model_2.tags << tag

      tag.reload.update_attribute(:taggings_count, 0)

      expect { Tag.reset_counters }.to change { tag.reload.taggings_count }.to(2)
    end
  end
end
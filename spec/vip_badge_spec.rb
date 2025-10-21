# frozen_string_literal: true

require "rails_helper"

describe "Discourse VIP Badge Plugin" do
  let(:vip_group) { Fabricate(:group, name: "vip") }
  let(:regular_group) { Fabricate(:group, name: "regular") }
  let(:vip_user) { Fabricate(:user) }
  let(:regular_user) { Fabricate(:user) }
  let(:staff_user) { Fabricate(:admin) }

  before do
    SiteSetting.vip_badge_group_names = "vip|premium"

    vip_group.add(vip_user)
    regular_group.add(regular_user)
  end

  describe "User#is_vip_user?" do
    it "returns true for users in VIP groups" do
      expect(vip_user.is_vip_user?).to eq(true)
    end

    it "returns false for users not in VIP groups" do
      expect(regular_user.is_vip_user?).to eq(false)
    end

    it "returns false when no VIP groups are configured" do
      SiteSetting.vip_badge_group_names = ""
      expect(vip_user.is_vip_user?).to eq(false)
    end
  end

  describe "Post serialization" do
    let(:topic) { Fabricate(:topic) }
    let(:vip_post) { Fabricate(:post, topic: topic, user: vip_user) }
    let(:regular_post) { Fabricate(:post, topic: topic, user: regular_user) }

    it "includes is_vip_user for staff members" do
      serializer = PostSerializer.new(vip_post, scope: Guardian.new(staff_user))
      json = serializer.as_json

      expect(json[:post][:is_vip_user]).to eq(true)
    end

    it "does not include is_vip_user for regular users" do
      serializer = PostSerializer.new(vip_post, scope: Guardian.new(regular_user))
      json = serializer.as_json

      expect(json[:post]).not_to have_key(:is_vip_user)
    end
  end
end

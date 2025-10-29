# frozen_string_literal: true

require "rails_helper"

describe PostsController do
  let(:vip_group) { Fabricate(:group, name: "vip") }
  let(:premium_group) { Fabricate(:group, name: "premium") }
  let(:regular_group) { Fabricate(:group, name: "regular") }
  let(:vip_user) { Fabricate(:user) }
  let(:premium_user) { Fabricate(:user) }
  let(:regular_user) { Fabricate(:user) }
  let(:staff_user) { Fabricate(:admin) }

  before do
    # Use group IDs instead of names since we're using group_list setting type
    SiteSetting.vip_badge_group_names = "#{vip_group.id}|#{premium_group.id}"

    vip_group.add(vip_user)
    premium_group.add(premium_user)
    regular_group.add(regular_user)
  end

  describe "User#is_vip_user?" do
    it "returns true for users in VIP groups" do
      expect(vip_user.is_vip_user?).to eq(true)
    end

    it "returns true for users in premium groups" do
      expect(premium_user.is_vip_user?).to eq(true)
    end

    it "returns false for users not in VIP groups" do
      expect(regular_user.is_vip_user?).to eq(false)
    end

    it "returns false when no VIP groups are configured" do
      SiteSetting.vip_badge_group_names = ""
      expect(vip_user.is_vip_user?).to eq(false)
    end

    it "returns false when plugin is disabled" do
      SiteSetting.vip_badge_enabled = false
      expect(vip_user.is_vip_user?).to eq(false)
    end
  end

  describe "User#vip_group_display_name" do
    it "returns the group display name for VIP users" do
      vip_group.update!(full_name: "VIP Members")
      expect(vip_user.vip_group_display_name).to eq("VIP Members")
    end

    it "returns the group name when no display name is set" do
      expect(vip_user.vip_group_display_name).to eq("vip")
    end

    it "returns nil for non-VIP users" do
      expect(regular_user.vip_group_display_name).to eq(nil)
    end
  end

  describe "Post serialization" do
    let(:topic) { Fabricate(:topic) }
    let(:vip_post) { Fabricate(:post, topic: topic, user: vip_user) }
    let(:regular_post) { Fabricate(:post, topic: topic, user: regular_user) }

    context "for staff members" do
      it "includes is_vip_user for VIP users" do
        serializer = PostSerializer.new(vip_post, scope: Guardian.new(staff_user))
        json = serializer.as_json

        expect(json[:post][:is_vip_user]).to eq(true)
      end

      it "includes vip_group_display_name for VIP users" do
        vip_group.update!(full_name: "VIP Members")
        serializer = PostSerializer.new(vip_post, scope: Guardian.new(staff_user))
        json = serializer.as_json

        expect(json[:post][:vip_group_display_name]).to eq("VIP Members")
      end

      it "does not include is_vip_user for regular users" do
        serializer = PostSerializer.new(regular_post, scope: Guardian.new(staff_user))
        json = serializer.as_json

        expect(json[:post][:is_vip_user]).to eq(false)
      end

      it "does not include vip_group_display_name for regular users" do
        serializer = PostSerializer.new(regular_post, scope: Guardian.new(staff_user))
        json = serializer.as_json

        expect(json[:post][:vip_group_display_name]).to eq(nil)
      end
    end

    context "for regular users" do
      it "does not include is_vip_user field" do
        serializer = PostSerializer.new(vip_post, scope: Guardian.new(regular_user))
        json = serializer.as_json

        expect(json[:post]).not_to have_key(:is_vip_user)
      end

      it "does not include vip_group_display_name field" do
        serializer = PostSerializer.new(vip_post, scope: Guardian.new(regular_user))
        json = serializer.as_json

        expect(json[:post]).not_to have_key(:vip_group_display_name)
      end
    end
  end
end

# frozen_string_literal: true

# name: discourse-vip-badge
# about: Adds a VIP badge to posts from users in designated VIP groups, visible only to staff members
# version: 1.0.0
# authors: mgm technology partners
# url: https://github.com/mgm-tp/discourse-vip-badge

register_asset "stylesheets/vip-badge.scss"
register_svg_icon "crown"

module ::VipBadge
  PLUGIN_NAME = "discourse-vip-badge"
end

after_initialize do
  # Load our extensions
  require_relative "lib/vip_badge/user_extension"
  require_relative "lib/vip_badge/post_serializer_extension"

  # Apply extensions to existing classes
  reloadable_patch { |plugin| User.prepend(VipBadge::UserExtension) }

  # Add VIP status to post serializer for staff members
  add_to_serializer(:post, :is_vip_user, include_condition: -> { scope.is_staff? }) do
    object.user&.is_vip_user?
  end
end

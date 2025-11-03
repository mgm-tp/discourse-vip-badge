# frozen_string_literal: true

# name: discourse-vip-badge
# about: Adds a VIP badge to posts from users in designated VIP groups, with configurable visibility
# version: 1.3.0
# authors: mgm technology partners
# url: https://github.com/mgm-tp/discourse-vip-badge
# meta_topic_id: tbd

enabled_site_setting :vip_badge_enabled

register_asset "stylesheets/vip-badge.scss"
register_svg_icon "crown"

module ::VipBadge
  PLUGIN_NAME = "discourse-vip-badge"

  # Helper function for VIP badge visibility
  def self.visible_to_scope?(scope)
    case SiteSetting.vip_badge_visibility
    when "all"
      true
    when "has trust level"
      min_trust = SiteSetting.vip_badge_visibility_min_trust_level.to_i
      scope.user.present? && scope.user.trust_level >= min_trust
    when "is staff or has trust level"
      min_trust = SiteSetting.vip_badge_visibility_min_trust_level.to_i
      (scope.is_staff?) || (scope.user.present? && scope.user.trust_level >= min_trust)
    when "is staff"
      scope.is_staff?
    when "is staff and has trust level"
      min_trust = SiteSetting.vip_badge_visibility_min_trust_level.to_i
      scope.is_staff? && scope.user.present? && scope.user.trust_level >= min_trust
    else
      false
    end
  end
end

after_initialize do
  # Load our extensions
  require_relative "lib/vip_badge/user_extension"
  require_relative "lib/vip_badge/post_serializer_extension"

  # Apply extensions to existing classes
  reloadable_patch { |plugin| User.prepend(VipBadge::UserExtension) }

  # Add VIP status to post serializer with configurable visibility
  add_to_serializer(
    :post,
    :is_vip_user,
    include_condition: -> { ::VipBadge.visible_to_scope?(scope) },
  ) { object.user&.is_vip_user? }

  # Add VIP group display name to post serializer with configurable visibility
  add_to_serializer(
    :post,
    :vip_group_display_name,
    include_condition: -> { ::VipBadge.visible_to_scope?(scope) },
  ) { object.user&.vip_group_display_name if object.user&.is_vip_user? }

  # Add VIP status to user serializer for user profiles
  add_to_serializer(
    :user,
    :is_vip_user,
    include_condition: -> { SiteSetting.vip_badge_show_on_profile && ::VipBadge.visible_to_scope?(scope) },
  ) { object.is_vip_user? }

  # Add VIP group display name to user serializer for user profiles
  add_to_serializer(
    :user,
    :vip_group_display_name,
    include_condition: -> { SiteSetting.vip_badge_show_on_profile && ::VipBadge.visible_to_scope?(scope) },
  ) { object.vip_group_display_name if object.is_vip_user? }
end

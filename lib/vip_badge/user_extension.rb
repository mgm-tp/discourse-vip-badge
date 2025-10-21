# frozen_string_literal: true

module VipBadge
  module UserExtension
    def is_vip_user?
      return false unless SiteSetting.vip_badge_enabled
      return false if SiteSetting.vip_badge_group_names.blank?

      vip_group_names = SiteSetting.vip_badge_group_names.split("|").map(&:strip)
      return false if vip_group_names.empty?

      # Check if user belongs to any of the VIP groups
      groups.where(name: vip_group_names).exists?
    rescue => e
      Rails.logger.warn("VIP Badge: Error checking VIP status for user #{id}: #{e.message}")
      false
    end
  end
end

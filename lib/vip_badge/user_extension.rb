# frozen_string_literal: true

module VipBadge
  module UserExtension
    def is_vip_user?
      return false unless SiteSetting.vip_badge_enabled
      return false if SiteSetting.vip_badge_group_names.blank?

      vip_group_ids = SiteSetting.vip_badge_group_names.split("|").map(&:to_i)
      return false if vip_group_ids.empty?

      groups.where(id: vip_group_ids).exists?
    rescue => e
      Rails.logger.warn("VIP Badge: Error checking VIP status for user #{id}: #{e.message}")
      false
    end

    def vip_group_display_name
      return nil unless is_vip_user?
      return nil if SiteSetting.vip_badge_group_names.blank?

      vip_group_ids = SiteSetting.vip_badge_group_names.split("|").map(&:to_i)
      vip_group = groups.where(id: vip_group_ids).first
      vip_group&.full_name.presence || vip_group&.name
    rescue => e
      Rails.logger.warn("VIP Badge: Error getting VIP group name for user #{id}: #{e.message}")
      nil
    end
  end
end

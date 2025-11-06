# frozen_string_literal: true

module VipBadge
  module UserExtension
    # Check if user is a VIP (any tier)
    def is_vip_user?
      return false unless SiteSetting.vip_badge_enabled
      vip_badge_tier.present?
    rescue => e
      Rails.logger.warn("VIP Badge: Error checking VIP status for user #{id}: #{e.message}")
      false
    end

    # Get the VIP tier for this user (gold, silver, or bronze)
    # Returns the highest tier the user belongs to
    def vip_badge_tier
      return @vip_badge_tier if defined?(@vip_badge_tier)
      return @vip_badge_tier = nil unless SiteSetting.vip_badge_enabled

      user_group_ids = groups.pluck(:id)

      # Check gold tier first (highest priority)
      gold_group_ids = get_group_ids_from_setting(SiteSetting.vip_badge_gold_groups)
      if gold_group_ids.present? && (gold_group_ids & user_group_ids).any?
        return @vip_badge_tier = "gold"
      end

      # Check silver tier
      silver_group_ids = get_group_ids_from_setting(SiteSetting.vip_badge_silver_groups)
      if silver_group_ids.present? && (silver_group_ids & user_group_ids).any?
        return @vip_badge_tier = "silver"
      end

      # Check bronze tier
      bronze_group_ids = get_group_ids_from_setting(SiteSetting.vip_badge_bronze_groups)
      if bronze_group_ids.present? && (bronze_group_ids & user_group_ids).any?
        return @vip_badge_tier = "bronze"
      end

      @vip_badge_tier = nil
    rescue => e
      Rails.logger.warn("VIP Badge: Error getting VIP tier for user #{id}: #{e.message}")
      @vip_badge_tier = nil
    end

    # Get the display name for the user's VIP group (for legacy use_group_name setting)
    def vip_group_display_name
      return nil unless is_vip_user?
      tier = vip_badge_tier
      return nil unless tier

      group_ids = get_group_ids_from_setting(SiteSetting.send("vip_badge_#{tier}_groups"))
      return nil if group_ids.blank?

      vip_group = groups.where(id: group_ids).first
      vip_group&.full_name.presence || vip_group&.name
    rescue => e
      Rails.logger.warn("VIP Badge: Error getting VIP group name for user #{id}: #{e.message}")
      nil
    end

    private

    def get_group_ids_from_setting(setting_value)
      return [] if setting_value.blank?
      setting_value.split("|").map(&:to_i)
    end
  end
end

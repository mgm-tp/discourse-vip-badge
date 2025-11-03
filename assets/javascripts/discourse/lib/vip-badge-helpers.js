/**
 * Shared utility functions for VIP badge plugin
 */

/**
 * Get the badge text based on settings and group name
 * @param {Object} siteSettings - The site settings service
 * @param {string} vipGroupDisplayName - The VIP group display name (if available)
 * @returns {string} The badge text to display
 */
export function getBadgeText(siteSettings, vipGroupDisplayName) {
  if (siteSettings.vip_badge_use_group_name && vipGroupDisplayName) {
    return vipGroupDisplayName;
  }
  return siteSettings.vip_badge_text || "VIP";
}

/**
 * Get the badge icon from settings
 * @param {Object} siteSettings - The site settings service
 * @returns {string} The icon name
 */
export function getBadgeIcon(siteSettings) {
  return siteSettings.vip_badge_icon;
}

/**
 * Check if VIP badges should be shown based on settings
 * Note: This only checks if the feature is enabled.
 * Visibility permissions are enforced server-side via serializers.
 * @param {Object} siteSettings - The site settings service
 * @returns {boolean} True if badges are enabled
 */
export function isBadgeEnabled(siteSettings) {
  return siteSettings.vip_badge_enabled;
}

/**
 * Check if VIP badges should be shown on profiles
 * @param {Object} siteSettings - The site settings service
 * @returns {boolean} True if profile badges are enabled
 */
export function isProfileBadgeEnabled(siteSettings) {
  return siteSettings.vip_badge_enabled && siteSettings.vip_badge_show_on_profile;
}

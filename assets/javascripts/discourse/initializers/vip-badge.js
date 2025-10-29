import { withPluginApi } from "discourse/lib/plugin-api";

function initializeVipBadge(api) {
  const currentUser = api.getCurrentUser();
  const siteSettings = api.container.lookup("service:site-settings");

  // Only show VIP badges to staff members
  if (!currentUser?.staff) {
    return;
  }

  // Track the VIP status and group display name properties for posts
  api.addTrackedPostProperties("is_vip_user", "vip_group_display_name");

  // Add VIP poster icon
  api.addPosterIcon((_, { is_vip_user, vip_group_display_name }) => {
    if (is_vip_user) {
      let badgeText;
      
      if (siteSettings.vip_badge_use_group_name && vip_group_display_name) {
        badgeText = vip_group_display_name;
      } else {
        badgeText = siteSettings.vip_badge_text || "VIP";
      }
      
      return {
        icon: "crown",
        title: "VIP User",
        className: "vip-badge-icon",
        text: badgeText,
      };
    }
  });
}

export default {
  name: "discourse-vip-badge",

  initialize() {
    withPluginApi((api) => initializeVipBadge(api));
  },
};

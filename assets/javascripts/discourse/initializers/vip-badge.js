import { withPluginApi } from "discourse/lib/plugin-api";

function initializeVipBadge(api) {
  const currentUser = api.getCurrentUser();
  const siteSettings = api.container.lookup("service:site-settings");

  // Only show VIP badges to staff members
  if (!currentUser?.staff) {
    return;
  }

  // Track the VIP status property for posts
  api.addTrackedPostProperties("is_vip_user");

  // Add VIP poster icon
  api.addPosterIcon((_, { is_vip_user }) => {
    if (is_vip_user) {
      const badgeText = siteSettings.vip_badge_text;
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

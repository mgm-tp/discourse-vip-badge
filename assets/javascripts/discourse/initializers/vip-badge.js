import { withPluginApi } from "discourse/lib/plugin-api";
import VipBadgeProfile from "../components/vip-badge-profile";
import {
  getBadgeIcon,
  getBadgeText,
  isBadgeEnabled,
} from "../lib/vip-badge-helpers";

function initializeVipBadge(api) {
  const siteSettings = api.container.lookup("service:site-settings");

  // Only initialize if badges are enabled
  if (!isBadgeEnabled(siteSettings)) {
    return;
  }

  // Track the VIP status, tier, and group display name properties for posts
  api.addTrackedPostProperties(
    "is_vip_user",
    "vip_badge_tier",
    "vip_group_display_name"
  );

  // Add VIP poster icon
  // Backend serializer already enforces visibility permissions.
  // If is_vip_user is present in the post data, the current user has permission to see it.
  api.addPosterIcon(
    (_, { is_vip_user, vip_badge_tier, vip_group_display_name }) => {
      if (is_vip_user) {
        return {
          icon: getBadgeIcon(siteSettings, vip_badge_tier),
          title: "VIP User",
          className: "vip-badge vip-badge-on-post vip-badge-" + vip_badge_tier,
          text: getBadgeText(
            siteSettings,
            vip_badge_tier,
            vip_group_display_name
          ),
        };
      }
    }
  );

  // Add VIP badge to user profiles using renderInOutlet
  api.renderInOutlet("user-post-names", VipBadgeProfile);
}

export default {
  name: "discourse-vip-badge",

  initialize() {
    withPluginApi((api) => initializeVipBadge(api));
  },
};

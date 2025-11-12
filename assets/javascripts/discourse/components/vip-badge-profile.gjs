import Component from "@glimmer/component";
import { service } from "@ember/service";
import icon from "discourse/helpers/d-icon";
import {
  getBadgeClasses,
  getBadgeIcon,
  getBadgeText,
  isProfileBadgeEnabled,
} from "../lib/vip-badge-helpers";

export default class VipBadgeProfile extends Component {
  @service siteSettings;

  get shouldShow() {
    // Backend serializer already enforces visibility permissions.
    // If is_vip_user is present in the model, the current user has permission to see it.
    return (
      isProfileBadgeEnabled(this.siteSettings) &&
      this.args.outletArgs?.model?.is_vip_user
    );
  }

  get tier() {
    return this.args.outletArgs?.model?.vip_badge_tier;
  }

  get badgeText() {
    return getBadgeText(
      this.siteSettings,
      this.tier,
      this.args.outletArgs?.model?.vip_group_display_name
    );
  }

  get badgeIcon() {
    return getBadgeIcon(this.siteSettings, this.tier);
  }

  get badgeClasses() {
    const classes = getBadgeClasses(this.siteSettings, this.tier);
    return `${classes} vip-badge-on-profile`;
  }

  <template>
    {{#if this.shouldShow}}
      <span
        class={{this.badgeClasses}}
        title={{this.badgeText}}
      >
        {{#if this.badgeIcon}}
          {{icon this.badgeIcon}}
        {{/if}}
        {{this.badgeText}}
      </span>
    {{/if}}
  </template>
}

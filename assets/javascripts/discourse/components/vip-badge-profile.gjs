import Component from "@glimmer/component";
import { service } from "@ember/service";
import icon from "discourse/helpers/d-icon";
import {
  getBadgeCustomCss,
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

  get customCss() {
    return getBadgeCustomCss(this.siteSettings, this.tier);
  }

  <template>
    {{#if this.shouldShow}}
      <span
        class="vip-badge-icon vip-badge-{{this.tier}}"
        style={{this.customCss}}
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

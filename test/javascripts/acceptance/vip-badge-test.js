import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";

acceptance("VIP Badge", function (needs) {
  needs.user({ admin: true, staff: true });
  needs.settings({
    vip_badge_enabled: true,
    vip_badge_group_names: "1|2",
    vip_badge_text: "VIP",
    vip_badge_use_group_name: false,
  });

  needs.pretender((server, { response }) => {
    server.get("/t/11.json", () =>
      response({
        post_stream: {
          posts: [
            {
              id: 14,
              name: null,
              username: "vip_user",
              avatar_template:
                "/letter_avatar_proxy/v2/letter/v/ecae2f/{size}.png",
              created_at: "2023-01-01T12:00:00.000Z",
              cooked: "<p>This is a VIP user post</p>",
              post_number: 1,
              post_type: 1,
              updated_at: "2023-01-01T12:00:00.000Z",
              reply_count: 0,
              reply_to_post_number: null,
              quote_count: 0,
              avg_time: null,
              incoming_link_count: 0,
              reads: 1,
              score: 0,
              yours: false,
              topic_id: 11,
              topic_slug: "vip-badge-test-topic",
              display_username: null,
              primary_group_name: null,
              primary_group_flair_url: null,
              primary_group_flair_bg_color: null,
              primary_group_flair_color: null,
              version: 1,
              can_edit: false,
              can_delete: false,
              can_recover: false,
              can_wiki: false,
              read: true,
              user_title: null,
              actions_summary: [],
              moderator: false,
              admin: false,
              staff: false,
              user_id: 2,
              hidden: false,
              hidden_reason_id: null,
              trust_level: 1,
              deleted_at: null,
              user_deleted: false,
              edit_reason: null,
              can_view_edit_history: false,
              wiki: false,
              is_vip_user: true,
              vip_group_display_name: "VIP Members",
            },
          ],
          stream: [14],
        },
        timeline_lookup: [[1, 0]],
        id: 11,
        title: "VIP Badge Test Topic",
        fancy_title: "VIP Badge Test Topic",
        posts_count: 1,
        created_at: "2023-01-01T12:00:00.000Z",
        views: 1,
        reply_count: 0,
        participant_count: 1,
        like_count: 0,
        last_posted_at: "2023-01-01T12:00:00.000Z",
        visible: true,
        closed: false,
        archived: false,
        has_summary: false,
        archetype: "regular",
        slug: "vip-badge-test-topic",
        category_id: 1,
        word_count: 5,
        deleted_at: null,
        user_id: 2,
        draft: null,
        draft_key: "topic_11",
        draft_sequence: 1,
        posted: false,
        unpinned: null,
        pinned_globally: false,
        pinned: false,
        pinned_at: null,
        pinned_until: null,
        details: {
          created_by: {
            id: 2,
            username: "vip_user",
            avatar_template:
              "/letter_avatar_proxy/v2/letter/v/ecae2f/{size}.png",
          },
          last_poster: {
            id: 2,
            username: "vip_user",
            avatar_template:
              "/letter_avatar_proxy/v2/letter/v/ecae2f/{size}.png",
          },
          participants: [
            {
              id: 2,
              username: "vip_user",
              avatar_template:
                "/letter_avatar_proxy/v2/letter/v/ecae2f/{size}.png",
              post_count: 1,
            },
          ],
          notification_level: 1,
          can_move_posts: false,
          can_edit: false,
          can_delete: false,
          can_recover: false,
          can_remove_allowed_users: false,
          can_invite_to: false,
          can_create_post: true,
          can_reply_as_new_topic: true,
          can_flag_topic: true,
        },
        highest_post_number: 1,
        last_read_post_number: 1,
        last_read_post_id: 14,
        deleted_by: null,
        has_deleted: false,
        actions_summary: [],
        chunk_size: 20,
        bookmarked: false,
      })
    );
  });

  test("VIP badge appears for staff users", async function (assert) {
    await visit("/t/vip-badge-test-topic/11");

    // Check if VIP badge exists
    assert.ok(
      exists(".vip-badge-icon"),
      "VIP badge icon is shown for staff users"
    );

    // Get the VIP badge element
    const badgeIcon = query(".vip-badge-icon");
    assert.strictEqual(
      badgeIcon.textContent.trim(),
      "VIP",
      "VIP badge displays the correct static text 'VIP'"
    );
  });

  test("VIP badge displays group name when use_group_name is enabled", async function (assert) {
    // Override settings for this test to use group name
    this.siteSettings.vip_badge_use_group_name = true;

    await visit("/t/vip-badge-test-topic/11");

    // Check if VIP badge exists
    assert.ok(
      exists(".vip-badge-icon"),
      "VIP badge icon is shown for staff users"
    );

    // Get the VIP badge element
    const badgeIcon = query(".vip-badge-icon");
    assert.strictEqual(
      badgeIcon.textContent.trim(),
      "VIP Members",
      "VIP badge displays the group display name 'VIP Members'"
    );
  });
});

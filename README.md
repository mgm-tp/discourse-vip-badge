# VIP Badge Plugin

This plugin adds a VIP badge to posts from users who belong to designated VIP groups. The badges are only visible to staff members.

## Features

- Displays a golden VIP badge next to posts from VIP users
- Badges appear on user posts
- Only visible to staff members
- VIP groups are configurable through site settings

## Settings

1. **VIP Group Names** (`vip_badge_group_names`): Pipe-separated list of group names that should be considered VIP groups (e.g., "vip|premium|donors")

## Installation

1. Place this plugin in your Discourse plugins directory
2. Rebuild your Discourse instance
3. Enable the plugin in Admin → Settings → Plugins
4. Configure the VIP group names in Admin → Settings → VIP Badge

## Technical Details

- Uses Discourse's plugin API to decorate post widgets
- Adds a `is_vip_user` method to the User model
- Extends post serializer to include VIP status for staff members only
- Responsive CSS styling with hover effects

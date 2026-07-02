# frozen_string_literal: true

# SPDX-License-Identifier: MIT
# Copyright (c) 2026 to present mgm technology partners GmbH
# See LICENSE file for details.

# Parts of the core features examples can be skipped like so:
#   it_behaves_like "having working core features", skip_examples: %i[login likes]
#
# List of keywords for skipping examples:
# login, likes, profile, topics, topics:read, topics:reply, topics:create,
# search, search:quick_search, search:full_page
#
# For more details, see https://meta.discourse.org/t/-/361381
RSpec.describe "Core features", type: :system do
  before { enable_current_plugin }

  it_behaves_like "having working core features"
end

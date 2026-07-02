// SPDX-License-Identifier: MIT
// Copyright (c) 2026 to present mgm technology partners GmbH
// See LICENSE file for details.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyPath,
  renderHeader,
  hasHeader,
  findInsertionIndex,
  applyHeader,
} from "./check-license-headers.mjs";

test("classifyPath maps extensions and names to styles", () => {
  assert.equal(classifyPath("plugin.rb"), "hash");
  assert.equal(classifyPath("Gemfile"), "hash");
  assert.equal(classifyPath("config/settings.yml"), "hash");
  assert.equal(classifyPath(".gitignore"), "hash");
  assert.equal(classifyPath(".discourse-compatibility"), "hash");
  assert.equal(classifyPath("a/b.scss"), "slash");
  assert.equal(classifyPath("eslint.config.mjs"), "slash");
  assert.equal(classifyPath("x.gjs"), "slash");
  assert.equal(classifyPath("README.md"), "html");
});

test("classifyPath excludes generated and comment-less files", () => {
  assert.equal(classifyPath("package.json"), null);
  assert.equal(classifyPath("Gemfile.lock"), null);
  assert.equal(classifyPath("pnpm-lock.yaml"), null);
  assert.equal(classifyPath(".ruby-lsp/Gemfile"), null);
  assert.equal(classifyPath("LICENSE"), null);
  assert.equal(classifyPath("Assets/logo.png"), null);
});

test("renderHeader prefixes each line per style", () => {
  assert.deepEqual(renderHeader("hash"), [
    "# SPDX-License-Identifier: MIT",
    "# Copyright (c) 2026 to present mgm technology partners GmbH",
    "# See LICENSE file for details.",
  ]);
  assert.equal(renderHeader("slash")[0], "// SPDX-License-Identifier: MIT");
  assert.equal(
    renderHeader("html")[0],
    "<!-- SPDX-License-Identifier: MIT -->"
  );
});

test("hasHeader detects the SPDX marker only near the top", () => {
  assert.equal(hasHeader("// SPDX-License-Identifier: MIT\ncode\n"), true);
  assert.equal(hasHeader("code\nmore\n"), false);
});

test("findInsertionIndex skips shebang and ruby magic comments", () => {
  assert.equal(findInsertionIndex(["code"], "slash"), 0);
  assert.equal(
    findInsertionIndex(["# frozen_string_literal: true", "code"], "hash"),
    1
  );
  assert.equal(
    findInsertionIndex(
      ["#!/usr/bin/env ruby", "# encoding: utf-8", "code"],
      "hash"
    ),
    2
  );
});

test("applyHeader inserts at top for slash files", () => {
  const out = applyHeader('import x from "y";\n', "slash");
  assert.equal(
    out,
    [
      "// SPDX-License-Identifier: MIT",
      "// Copyright (c) 2026 to present mgm technology partners GmbH",
      "// See LICENSE file for details.",
      "",
      'import x from "y";',
      "",
    ].join("\n")
  );
});

test("applyHeader keeps frozen_string_literal on line 1", () => {
  const out = applyHeader("# frozen_string_literal: true\n\ncode\n", "hash");
  const lines = out.split("\n");
  assert.equal(lines[0], "# frozen_string_literal: true");
  assert.equal(lines[1], "");
  assert.equal(lines[2], "# SPDX-License-Identifier: MIT");
  assert.equal(lines[4], "# See LICENSE file for details.");
  assert.equal(lines[5], "");
  assert.equal(lines[6], "code");
});

test("applyHeader is idempotent via hasHeader guard", () => {
  const once = applyHeader("code\n", "hash");
  assert.equal(hasHeader(once), true);
});

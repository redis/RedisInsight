# [VERSION] ([MONTH] [YEAR])

[Release description based on content - will be auto-generated]

### Headlines

* [Top 3-5 most important items - features or critical bugs]

### Details

* #[TICKET-KEY] [Feature or improvement summary]

### Bugs

* #[TICKET-KEY] [Bug fix summary]

---

**OR (when only bugs):**

### Bug fixes

* #[TICKET-KEY] [Bug fix summary]

---

### New Contributors

* @[github-handle] made their first contribution in [PR link]

(Include this section only when there is at least one new contributor since the previous release. Start from GitHub's auto-generated list via `gh api -X POST repos/redis/RedisInsight/releases/generate-notes -f tag_name=[VERSION] -f previous_tag_name=[LAST_RELEASED] -f target_commitish=main --jq '.body'`, but note it only catches authors whose commits land directly on `main` — external contributors whose work was merged through a feature branch (and then squashed) will be missed and must be added manually.)

---

**SHA-512 Checksums**

[Link to checksums]

**Full Changelog**: [Link to changelog]

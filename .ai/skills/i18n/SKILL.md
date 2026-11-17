---
name: i18n
description: >-
  Internationalization conventions for the RedisInsight UI (i18next). Use when
  adding or changing user-facing strings under redisinsight/ui/**, editing the
  locale files (en.json/bg.json), translating API errors or notifications, or
  when the user mentions i18n, translations, locales, i18next, or <Trans>.
---

# Internationalization (i18n)

RedisInsight UI is localized with **i18next** + **react-i18next**. English (`en`)
is the source of truth; Bulgarian (`bg`) is the second locale.

## Where things live

- `redisinsight/ui/src/i18n/` — the i18next instance and barrel. Import from `uiSrc/i18n`.
- `redisinsight/ui/src/i18n/locales/en.json` and `bg.json` — the translations (flat keys).
- `redisinsight/ui/src/i18n/i18next.d.ts` — augments i18next types from `en.json`, so keys are **type-checked** (a typo in `t('…')` fails `type-check`).
- `i18next.config.mjs` — extraction config.
- `scripts/check-i18n-locales.js` — duplicate-key CI check.

## Choosing the API

| Use                                                      | When                                                                                                                                                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useTranslation()` hook → `t`                            | Inside a **React component** rendered in the tree.                                                                                                                                                  |
| `i18n.t` **singleton** (`import i18n from 'uiSrc/i18n'`) | **Non-React** code: redux thunks, factories, utils, message builders (e.g. `error-messages.tsx`, `success-messages.tsx`, `INFINITE_MESSAGES`). These run outside React, so the hook is unavailable. |
| `<Trans>` (from `uiSrc/i18n`)                            | A message with **mid-sentence markup/links** — bold spans, inline `<a>`. Keys use component tags: `"… <consoleLink>Cloud console</consoleLink> …"` + `components={{ consoleLink: <a … /> }}`.       |

## Usage examples

**Hook — inside a React component:**

```tsx
import { useTranslation } from 'uiSrc/i18n';

const AddKeyButton = () => {
  const { t } = useTranslation();
  return <PrimaryButton>{t('browser.addKey.button.submit')}</PrimaryButton>;
};
```

**Singleton — non-React code (thunks, factories, utils):**

```ts
import i18n from 'uiSrc/i18n';

export const deletedKeyMessage = () => ({
  title: i18n.t('browser.deletedKey.title'),
});
```

**Interpolation — pass `values`; reference `{{vars}}` in the string:**

```tsx
// en.json: "browser.deletedKey.message": "{{name}} has been deleted."
t('browser.deletedKey.message', { name: keyName });
```

**`<Trans>` — mid-sentence markup or links (map tags to components):**

```tsx
import { Trans } from 'uiSrc/i18n';

// en.json: "browser.docs": "See the <docsLink>documentation</docsLink> for details."
<Trans
  i18nKey="browser.docs"
  components={{
    docsLink: <a href={DOCS_URL} target="_blank" rel="noreferrer" />,
  }}
/>;
// interpolation still works alongside components via `values={{ … }}`
```

**Backend error `resource` — interpolated automatically:**

```ts
// Response: { errorCode: 11200, resource: { databaseId: 'abc' } }
// en.json:  "api.error.code.11200.message": "Database {{databaseId}} already exists."
// getTranslatedApiError() fills {{databaseId}} from response.data.resource — no extra code.
```

## Plurals

Use i18next's native **`count`-based** plurals — never a hand-rolled `isPlural` branch with
`.single`/`.plural` keys.

- Add one key per plural form with the i18next suffix: `key_one`, `key_other` (a language may
  need more forms — `_few`, `_many` — but `en`/`bg` only use `_one`/`_other`).
- Reference the **base** key (no suffix) and pass `count`; i18next selects the form:
  `t('key', { count })` or `<Trans i18nKey="key" count={n} …/>`.
- The base key type-checks even though only the suffixed forms are in `en.json` — i18next's
  types resolve it from the `_one`/`_other` entries.
- **Write the whole sentence in each form.** Don't interpolate the one differing word as a
  fragment — word order, agreement, and the number of plural forms vary by language.
- Renaming a key (e.g. `.single` → `_one`) leaves the old key behind in `bg.json` because
  `i18n:extract` doesn't prune — delete the orphan so en/bg parity holds.

```tsx
// en.json:
//   "workbench.runConfirm.body_one":   "…This command is part of…"
//   "workbench.runConfirm.body_other": "…These commands are part of…"
<Trans i18nKey="workbench.runConfirm.body" count={commands.length} components={{ bold }} />
```

## Keys

- **Flat, dotted keys** — `keySeparator` and `nsSeparator` are `false`, so a dot is a literal character, not nesting. `"api.error.code.11000.title"` is a single key.
- **`en.json` is the type source** — every literal `t('…')` / `i18nKey="…"` must exist in `en.json` or `type-check` fails. Dynamic/computed keys can't be statically typed — cast with `as never` (e.g. ``i18n.t(`api.error.code.${code}.message` as never)``), the same pattern used across the codebase.
- **en/bg parity + sorted** — keep the same key set in both files, alphabetically sorted (what `i18n:extract` produces). Edit values **in place** where possible; only re-sort when adding keys.
- Empty `bg` values are OK as a "translate later" placeholder — `returnEmptyString: false` makes them **fall back to English**, not render blank.
- `escapeValue: false` — interpolated values are **not** HTML-escaped (React escapes plain strings at render).

## Namespaces

The top-level segment says **where a string belongs**. There are two kinds:

**1. Cross-cutting (by source), not tied to a page:**

- **`api.*`** — content **keyed by a backend identifier** (the API contract). Today `api.error.code.<errorCode>.{title,message}`; scales to `api.<type>.*` for any future API-originated content.
- **`notification.*`** — FE-authored toast copy: `notification.{error,success,infinite}.*`.
- **`common.*`** — labels reused across many pages: `common.button.save`, `common.button.cancel`, `common.button.delete`, `common.loading`, `common.yes`, `common.no`.

**2. By page/module** — most UI copy. Top-level = the feature (mirror the folder in
`redisinsight/ui/src/pages/<page>` → `<page>.*`); nest by section/component; the leaf
describes the string. A page owns its keys; only promote to `common.*` when genuinely shared.

| Namespace     | Module (`pages/…`) | Example keys                                                                                                  |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `browser.*`   | `browser`          | `browser.keyList.empty`, `browser.addKey.title`, `browser.filter.placeholder`, `browser.addKey.button.submit` |
| `workbench.*` | `workbench`        | `workbench.editor.runTooltip`, `workbench.results.empty`                                                      |
| `rdi.*`       | `rdi`              | `rdi.pipeline.deploy.title`, `rdi.config.button.deploy`                                                       |
| `settings.*`  | `settings`         | `settings.section.general`, `settings.language.title`                                                         |

Common leaf segments: `*.title`, `*.description`, `*.label`, `*.placeholder`, `*.tooltip`,
and **`*.button.<action>`** for action labels (keep them distinct from titles/descriptions,
e.g. `browser.addKey.button.submit`, `api.error.code.11024.button.signIn`).

## Backend error codes

The backend ships a stable `errorCode` on every user-facing error (see
`redisinsight/api/src/constants/custom-error-codes.ts`). The UI translates by that code:

- `getTranslatedApiError(error)` and `getTranslatedApiTitle(error)` in
  [utils/apiResponse.ts](../../../redisinsight/ui/src/utils/apiResponse.ts) look up
  `api.error.code.<n>.message` / `.title` and **fall back to the backend text** when the key is absent.
- `parseCustomError` in [utils/errors.tsx](../../../redisinsight/ui/src/utils/errors.tsx) does the same in its `default` case for coded errors it doesn't special-case.
- `resource` interpolation: any `response.data.resource` object fills `{{vars}}` in the message.

## Adding or editing a translation

1. Add the key + English value to `en.json` **and** the same key to `bg.json` (translated, or empty to defer). Keep both sorted and in parity.
2. Reference it: `t('my.key')` / `i18n.t('my.key')` / `<Trans i18nKey="my.key" …/>`.
3. For dynamic values, pass `values` (interpolation) or `resource` (backend errors).
4. Run `npm run i18n:extract` to sync/sort, and `npm run i18n:check` to catch duplicate keys.
5. `npm run type-check` (new literal keys must resolve) and `npm run lint:ui`.

## Tooling

- `npm run i18n:extract` — scans `t()`/`<Trans>` usages and syncs `en.json`/`bg.json` (alphabetical; does **not** prune unused keys). Note: dynamic (`as never`) keys aren't discovered by extraction — keep them in the locale files manually.
- `npm run i18n:check` — fails if a locale file has a **duplicate key** (JSON silently keeps the last, so a dup would shadow a value). Runs in CI on PRs touching `locales/**`.
- Dev override: append `?lang=bg` to the URL to preview Bulgarian.

## Do / Don't

- ✅ Non-React code uses the `i18n` singleton; components use `useTranslation`.
- ✅ Namespace by page (`<page>.*` mirroring `pages/<page>`), or by source (`api.*`, `notification.*`, `common.*`); shared labels go in `common.*`.
- ✅ Keep en/bg key parity; empty bg is an acceptable "later" placeholder.
- ❌ Don't hardcode user-facing strings — add a key.
- ❌ Don't hand-edit the locale-file key order — let `i18n:extract` sort.
- ❌ Don't hand-roll plurals with a JS branch — use `count` + `key_one`/`key_other` (see Plurals).

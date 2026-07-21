# i18n

App-level [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) setup.

- Single `translation` namespace.
- `lng` / `fallbackLng`: `en`. Supported: `en`, `bg`.
- Locales live in [`locales/`](./locales) — `en.json` is the source of truth.
- Type-safe keys: [`i18next.d.ts`](./i18next.d.ts) augments i18next with `typeof en.json`. No codegen — add a key to `en.json` and `t()` picks it up.

## Using a string

```tsx
import { useTranslation } from 'uiSrc/i18n'

const { t } = useTranslation()
return <span>{t('myKey')}</span>
```

Add `myKey` to `locales/en.json` first; `t()` rejects unknown keys at compile time.

## Extraction

`npm run i18n:extract` (from repo root) scans `t()` usages and updates `locales/en.json` / `locales/bg.json` via `i18next-cli` (config: `i18next.config.mjs`).

## Tests

`renderComponent` / `renderHook` wrap with the **real** i18n instance (not a `t: k => k` mock), so `getByText('Actual copy')` assertions keep working as strings migrate to `t()`.

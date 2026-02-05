---
name: "i18n-enforcer"
description: "Enforces internationalization (i18n) best practices by detecting hardcoded strings and ensuring all UI text uses translation keys. Invoke when writing UI code or checking for localization issues."
---

# Internationalization (i18n) Enforcer

This skill helps ensure that the application properly supports multiple languages (English/Chinese) by preventing hardcoded strings and enforcing the use of `i18next`.

## Guidelines

1.  **No Hardcoded Strings**:
    *   ❌ Incorrect: `<Button>New Chat</Button>` or `title || "New Chat"`
    *   ✅ Correct: `<Button>{t("ai.new_chat")}</Button>` or `title || t("ai.new_chat")`

2.  **Use Translation Keys**:
    *   Always use the `t("key")` function from `useTranslation` hook.
    *   Define keys in `src/i18n.ts` (or the relevant locale file).
    *   Ensure keys exist for ALL supported languages (e.g., `en`, `zh-CN`).

3.  **Fallback Handling**:
    *   Do NOT use English strings as fallbacks in the code (e.g., `t("key") || "English Fallback"`).
    *   The fallback should be handled by the i18n configuration (`fallbackLng: "en"`), or the key should be guaranteed to exist.

## Checklist for Review

When reviewing or writing code, check the following:

- [ ] Are there any user-facing strings hardcoded in the component?
- [ ] Do all `t("key")` calls have corresponding entries in `src/i18n.ts`?
- [ ] Are there entries for both English and Chinese?
- [ ] Are dynamic values handled using interpolation (e.g., `t("welcome", { name: user.name })`) instead of string concatenation?

## Common Pitfalls

- **Logical Fallbacks**: Be careful with logical OR `||`.
    *   `const title = savedTitle || "Default Title"` -> **WRONG** (Hardcoded)
    *   `const title = savedTitle || t("default_title")` -> **RIGHT**
- **Component Props**: Check props like `placeholder`, `title`, `aria-label`.
    *   `<Input placeholder="Search..." />` -> **WRONG**
    *   `<Input placeholder={t("common.search")} />` -> **RIGHT**

## Action Plan

If you detect hardcoded strings:
1.  Identify the string and context.
2.  Create a semantic key (e.g., `nav.home`, `error.network`).
3.  Add the key and translations to `src/i18n.ts`.
4.  Replace the hardcoded string with `{t("new.key")}`.

# Browser Image OCR v0.5.1

## Summary

This release improves day-to-day usability, updates the default model, and starts separating compatibility by provider instead of only by model name.

## Highlights

- Refined the OCR workspace layout to keep results easier to reach during use
- Removed the awkward sticky result panel behavior during page scrolling
- Changed the default model to `gpt-5.2`
- Added provider-aware compatibility options
- Added support for Anthropic Claude native API mode
- Split the documentation into separate English and Simplified Chinese README files

## User-facing Changes

- The OCR result area now feels more like a working panel and less like a landing page
- The primary action is placed closer to the result area
- Scrolling behavior is more natural while moving between result and image sections
- Users can now choose a provider family instead of relying only on a model name

## Compatibility

Currently supported provider modes:

- OpenAI / Generic OpenAI-compatible
- Gemini via OpenAI-compatible gateway
- Anthropic Claude native Messages API

## Upgrade Notes

If you installed the extension through `Load unpacked`, it will not auto-update.

To upgrade:

1. Pull or replace the local project files
2. Open `edge://extensions` or `chrome://extensions`
3. Find `Browser Image OCR`
4. Click `Reload`

## Notes

- Native Gemini, DashScope native APIs, and other non-OpenAI-native services may still require additional provider adapters
- This release keeps the extension frontend-only

# Browser Image OCR v0.5.0

## Summary

This release turns the project into a cleaner open-source package and upgrades the OCR page into a more product-like experience.

## Highlights

- Rebranded the public project identity to `Browser Image OCR`
- Refreshed the OCR page UI with a more polished visual layout
- Added visible extension version information in the UI
- Added in-product guidance for local upgrades and store-based auto-update expectations
- Published repository docs for open-source use, including changelog and contribution guidance

## User-facing Changes

- The extension now shows version information directly in the OCR page
- The OCR page better explains local unpacked upgrade behavior
- The interface is more readable on both desktop and mobile-sized windows

## Repository Updates

- Added `CHANGELOG.md`
- Added `CONTRIBUTING.md`
- Improved `README.md`
- Kept the repository license aligned with `Apache-2.0`

## Upgrade Notes

If you installed the extension through `Load unpacked`, it will not auto-update.

To upgrade:

1. Pull or replace the local project files
2. Open `edge://extensions` or `chrome://extensions`
3. Find `Browser Image OCR`
4. Click `Reload`

## Notes

- Automatic updates generally require publishing through Chrome Web Store or Edge Add-ons
- This release does not introduce a backend service; the extension remains frontend-only

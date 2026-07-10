# Data Migration Notes

This site now treats Netlify Blobs as the primary persistent store for editable site data.

## What Changed

- `data.json` is a seed and local fallback only.
- `/api/site`, `/api/works`, and `/api/schedule` read and write `portfolio-data.json` in the `site-data` Blob store.
- On first read, if the Blob is empty, the API tries to migrate existing Netlify Database rows first.
- If Netlify Database is empty or unavailable, the API seeds from `data.json`.
- Uploaded files continue to use the `uploads` Blob store and are served through `/uploads/:filename`.
- Media upload no longer asks for a category. Existing category metadata is still tolerated for old files.

## Safety Rules

- A failed Blob read blocks write requests instead of silently writing fallback data.
- Each successful data save writes a timestamped backup under `site-data/backups/`.
- `force=true` on `/api/seed` overwrites Blob data with `data.json`; use it only after backing up current data.

## Recommended Deployment Flow

1. Deploy this branch to a Netlify preview first.
2. Open `/api/site`, `/api/works`, and `/api/schedule` on the preview and confirm the expected data appears.
3. Open `/admin.html#media` and upload a test image.
4. Confirm the image appears on `/portfolio.html`.
5. Save a small text change in Admin, refresh the page, and confirm it persists.
6. Promote or merge only after the preview data looks correct.

## Backup

Before a production migration, export or copy:

- Current Netlify Database rows, if you have been using Netlify Database.
- Existing `data.json` from the repository.
- Existing uploaded files from the `uploads` Blob store.

The code also creates Blob backups automatically on each save, but an external backup is still recommended before the first production migration.

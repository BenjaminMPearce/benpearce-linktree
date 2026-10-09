# Maintenance & handoff

This document describes the production architecture and routine maintenance for the Benjamin Pearce portfolio.

## Live environments

- Public website: https://benjaminmpearce.github.io/benpearce-linktree/
- Admin control room: https://benjaminmpearce.github.io/benpearce-linktree/admin/
- Source: https://github.com/BenjaminMPearce/benpearce-linktree
- Production branch: `main`

## Publishing content

1. Sign in to the admin control room using an authorized account.
2. Open **Links**, **Site Text**, or **Media**.
3. Make edits and choose **Save draft** to retain them privately.
4. Choose **Publish** and complete the confirmation step to make the edited record public.
5. Check the public website and refresh if an older version is cached.

Content publishing through the CMS does **not** require a GitHub commit. Source-code and design changes **do** require a repository deployment.

## Deployment

The repository includes `.github/workflows/pages.yml` for GitHub Pages deployment. Check **Actions** for the latest deployment status before declaring a source-code change live.

Avoid modifying or deleting the deployment workflow during routine documentation cleanup.

## Architecture

- `index.html`, `styles.css`, and `app.js`: public presentation and interactions.
- `public-cms.js`: loads published site copy, links, and media from Supabase; falls back to static content if unavailable.
- `admin/index.html`: authenticated content editing, publishing, uploads, and analytics.
- Supabase: authentication, content database, and media storage.

The publishable/anonymous browser key is not a secret; **service-role keys and other privileged credentials are secrets** and must never be placed in browser code or GitHub commits.

## Pre-release checks

- Confirm the public page renders on narrow and wide screens.
- Verify video cards, external links, and media playback.
- Confirm an authorized admin can save a draft, publish with confirmation, and see the public change.
- Confirm unauthorized users cannot access administrative data or write content.
- Verify image uploads, page analytics, and sign-out.
- Confirm the GitHub Pages workflow finishes successfully.

## Change management

Keep commits focused and descriptive. Test changes to the admin editor separately from public-site styling. Preserve the production branch and avoid deleting media files until references and backups have been checked.

## Security and ownership

Do not add credentials, customer data, access exports, or production backups to this public repository. Review Supabase access and deployment ownership during handoff. For suspected vulnerabilities, use private communication with the repository owner rather than publishing sensitive details in a public issue.

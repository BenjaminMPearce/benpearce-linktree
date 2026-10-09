<div align="center">

# BENJAMIN PEARCE
### THE DIRECTOR'S CUT

<img src="./ben-pearce-directors-cut-4k.webp" alt="Benjamin Pearce — Director's Cut cinematic artwork" width="360" />

**Films · Comedy · Stories worth watching**

[**View the portfolio ↗**](https://benjaminmpearce.github.io/benpearce-linktree/) · [**Project documentation**](./docs/MAINTENANCE.md)

![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-161b22?style=flat-square&logo=github)
![Stack](https://img.shields.io/badge/Stack-HTML_%C2%B7_CSS_%C2%B7_JavaScript-161b22?style=flat-square)
![CMS](https://img.shields.io/badge/Content-Supabase-161b22?style=flat-square&logo=supabase)

</div>

---

## The experience

A custom, mobile-first filmmaker portfolio for **Benjamin Pearce**, bringing films, comedy, video collections, credits, and social channels into one cinematic destination.

The public experience features a Director's Cut hero, a curated media collection, embedded video previews, and links to Benjamin's creative work. A separate authenticated control room provides content management without editing source code.

## Behind the scenes

| Experience | Capabilities |
| --- | --- |
| **Public portfolio** | Responsive cinematic design, media cards, video previews, profile links |
| **Director's control room** | Edit links, site copy, and media; save drafts; confirm publication |
| **Content management** | Supabase-backed published content with static-site fallback |
| **Analytics** | Portfolio views and tracked link interactions |
| **Delivery** | Static GitHub Pages deployment through GitHub Actions |

## Project structure

```text
.
├── index.html            # Public portfolio
├── styles.css            # Public visual system
├── app.js                # Public interactions
├── public-cms.js         # Published-content renderer
├── admin/
│   └── index.html        # Authenticated control room
├── manifest.webmanifest  # App metadata
├── sw.js                 # Service worker
├── docs/
│   └── MAINTENANCE.md    # Operations and handoff notes
└── .github/
    └── workflows/
        └── pages.yml     # Deployment
```

## Development

This is a static HTML, CSS, and JavaScript project. No bundler or build step is required.

For local development, serve the repository using a local HTTP server (rather than opening `index.html` as a file), so browser fetches and service-worker behavior can be evaluated correctly.

Content is managed in Supabase. The public site loads published data, while the admin requires an authorized account. **Never commit Supabase service-role keys, access tokens, passwords, or customer exports.**

For deployment, CMS behavior, and operational notes, see [Maintenance & handoff](./docs/MAINTENANCE.md).

## Ownership & credits

**Portfolio and creative identity:** Benjamin Pearce  
**Website design & development:** [SRCcvde](https://srccvde.com)

This repository is published for hosting and project maintenance. Its availability does not imply that the artwork, media, branding, or code are licensed for reuse. Contact the respective rights holders before copying or redistributing project assets.

<h1 align="center">
  Ahmad Syaufi Faid — personal site
</h1>
<p align="center">
  Personal resume/portfolio site, built with <a href="https://www.gatsbyjs.org/" target="_blank">Gatsby</a>, deployed to <a href="https://paksopi.me">paksopi.me</a>.
</p>
<p align="center">
  Design forked from <a href="https://github.com/bchiang7/v4" target="_blank">bchiang7/v4</a> (MIT), Brittany Chiang's portfolio — credited per that repo's forking request. See its <a href="https://github.com/bchiang7/v4#-color-reference" target="_blank">original README</a> for the base template's own docs.
</p>

## Content structure

- `src/config.js` — contact info, social links, nav links, color theme.
- `content/jobs/<Company>/index.md` — work experience (frontmatter: `date`, `title`, `company`, `location`, `range`, `url`; body = bullet list).
- `content/projects/<Name>.md` — projects grid (frontmatter: `date`, `title`, `github`, `external`, `tech`, `showInProjects`; body = description).
- `content/featured/<Name>/index.md` — large featured project cards (same as projects, plus a `cover` image) — currently unpopulated.
- `content/posts/` — blog scaffolding, currently unpopulated.
- `src/components/sections/{hero,about,contact}.js` — hardcoded intro/bio/contact copy.

## Installation & Set Up

1. Install and use the correct Node version via [NVM](https://github.com/nvm-sh/nvm): `nvm install`
2. Install dependencies: `yarn` (or `npm install`)
3. Start the development server: `npm start`

## Building for production

```sh
npm run build   # outputs static site to public/
npm run serve   # preview the production build locally
```

Production builds run in GitHub Actions (see `.github/workflows/build.yml`), not on the homelab host — Gatsby/webpack builds are memory-heavy for the low-RAM box this site is deployed to. The built `public/` output is pushed to the `dist` branch and pulled by the deploy host.

## Resolved: homepage used to render empty in static HTML

The homepage (`/` only) used to gate all content behind an intro loading animation (`isLoading` state in `layout.js` defaulting to `true` on `isHome`, showing `Loader` from `loader.js`). Since `isLoading` only flipped to `false` client-side after the animation finished, the SSR/build-time HTML for `/` contained only the loader SVG — no name, bio, or nav. Crawlers/bots that don't execute JS (and link-preview unfurlers like LinkedIn/Slack/Twitter) saw nothing. Every other page (`archive.js`, `gallery.js`, etc.) was unaffected since `isHome` was `false` there.

**Fixed** by removing the loader entirely: `layout.js` now always renders `Nav`/`Social`/`Email`/`children`/`Footer` directly, no `isLoading` branch. Deleted `src/components/loader.js`, `src/components/icons/loader.js` (`IconLoader`, also removed from `icons/index.js` and the `icon.js` switch), and the `animejs` dependency from `package.json` (regenerated `yarn.lock`). Verified via grep that nothing else referenced `Loader`/`animejs`, and `npx eslint` on the touched files passed clean.

Remaining from the original audit, not yet done: `og:image` / `twitter:image` meta are still empty (check `src/components/head.js`) — shared links still get no preview thumbnail.

## Color reference

| Color          | Hex       |
| -------------- | --------- |
| Navy           | `#12181f` |
| Dark Navy      | `#080b0f` |
| Accent (green var) | `#f2b632` |

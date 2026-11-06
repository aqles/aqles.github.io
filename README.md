# Portfolio Hub

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Deploy](https://github.com/aqles/aqles.github.io/actions/workflows/static.yml/badge.svg)

> 🔗 **Live Demo:** [https://aqles.github.io](https://aqles.github.io)

Welcome to the official portfolio landing page for [Ednasalam](https://ednasalam.com). This repository hosts a lightweight, mobile-first static site that serves as a central hub for my digital presence, connecting visitors to my main portfolio, social channels, and latest open-source contributions.

## 🚀 Features

-   **Plain HTML, CSS, and JavaScript**: No build step and no framework. Fonts come from Google Fonts and icons from FontAwesome, both loaded from CDNs.
-   **Layout**: One column that fits phones first. The repo cards switch to two columns on screens 600px and wider.
-   **Repo list**: Latest public repos from the GitHub API, cached for 30 minutes. This site's own repo and test repos are filtered out, as are forks and archived repos.
-   **Create page**: A page where anyone can type a GitHub username and preview a hub page like this one, then download it as a single HTML file.
-   **Look**: Dark colours close to GitHub's dark theme, translucent panels, and three blurred background blobs.
-   **Easter eggs**: Two buttons, 'Let it Snow' and 'Start Firework'. Each starts its effect and stops it when clicked again.
-   **Security**: The pages set a Content-Security-Policy with a meta tag (GitHub Pages cannot send custom response headers), and the FontAwesome stylesheet carries an integrity hash.
-   **Sharing metadata**: Open Graph and Twitter Card tags point at the GitHub avatar, so shared links show a picture.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+).
-   **Fonts**: 'Outfit' (Headings) and 'Space Grotesk' (Body) via Google Fonts.
-   **Icons**: FontAwesome 6.
-   **Hosting**: GitHub Pages.

## 📂 Project Structure

```bash
aqles.github.io/
├── .github/
│   └── workflows/
│       └── static.yml   # Deploys the site to GitHub Pages
├── assets/
│   └── favicon.ico
├── css/
│   └── global.css       # All styles
├── js/
│   ├── main.js          # Repo list, avatar fallback, snow and firework effects
│   └── create.js        # Create page: username form, preview, and download
├── 404.html             # Not-found page
├── create.html          # Create-your-own-page form and preview
├── index.html           # Main page
├── LICENSE
├── README.md
├── robots.txt
└── sitemap.xml
```

## 🔧 Local Development

To run this project locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/aqles/aqles.github.io.git
    cd aqles.github.io
    ```

2.  **Serve the folder**:
    ```bash
    python3 -m http.server 8000
    ```
    Then open http://localhost:8000 in the browser.

    Opening `index.html` as a file does not work: the asset paths start with `/` and the script loads as a module, and both need the page to be served over HTTP.

## 📝 Change Log

### v3.2.0 (2026-11-06)
- Added a create page: type any GitHub username and get a preview of a hub page like this one, built from that account's public GitHub data.
- The preview can be downloaded as a single HTML file with the styles included, so it can be hosted anywhere as-is.
- The home page now links to the create page, under the main portfolio button.

### v3.1.1 (2026-11-06)
- Fixed the social preview image (it pointed at an invalid avatar URL, so shared links showed no picture).
- Added `rel="noopener noreferrer"` to external links.
- Added a Content-Security-Policy (meta tag, since GitHub Pages can't send custom headers) and an integrity check for the Font Awesome stylesheet.
- The repo list no longer shows this site itself or test repos, and results are cached for 30 minutes so the GitHub API limit is not hit on every visit.
- Removed vercel.json (the site is hosted on GitHub Pages, which ignores it) and the CNAME file (not needed for the default aqles.github.io domain).
- Added the MIT LICENSE file, fixed the README (local run instructions, feature list), and added reduced-motion support, visible focus outlines, and ARIA state on the effect buttons.

### v3.1.0 (2025-12-28)
-   **New Feature**: Added 'Let it Snow' easter egg button with physics-based snowflake animation (sway & fall).
-   **New Feature**: Added 'Firework' easter egg button with particle trails, gravity, and vibrant colors.
-   **Update**: Added X (formerly Twitter) link for user `aqles`.
-   **UX**: Improved animation performance and smoothness.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/aqles/aqles.github.io/issues).

## 📄 License

This project is [MIT](LICENSE) licensed.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/aqles">Ednasalam</a>
</p>

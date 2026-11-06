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
-   **Look**: Dark colours close to GitHub's dark theme, flat surfaces, and one blue accent. The name is set large at the top, and repositories are shown as a plain list.
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

### November 2026
- Fixed the intro text on the create page being too dark to read.
- Redesigned the home page: the name set large as type, flat colours with one blue accent, repositories as a plain list, and the create form now sits on the home page too.
- Rebuilt the snow and firework effects on canvas: flakes drift with wind and depth, rockets climb and burst with twinkle and crackle.
- Added a create page: type a GitHub username, preview a hub page like this one, and download it as a single HTML file. The home page links to it.
- Fixed the create page form on phones: full-width input, and the download button stays hidden until a preview exists.
- Fixed the social preview image, and added `rel="noopener noreferrer"` to external links.
- Added a Content-Security-Policy meta tag and an integrity check for the Font Awesome stylesheet.
- The repo list skips this site and test repos now, and caches results for 30 minutes.
- Removed vercel.json and the CNAME file; GitHub Pages does not use them.
- Added the MIT LICENSE, fixed the local run instructions, and added reduced-motion support, visible focus outlines, and ARIA state on the effect buttons.

### December 2025
- Added two easter egg buttons, 'Let it Snow' and 'Firework'.
- Added the X (formerly Twitter) link.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/aqles/aqles.github.io/issues).

## 📄 License

This project is [MIT](LICENSE) licensed.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/aqles">Ednasalam</a>
</p>

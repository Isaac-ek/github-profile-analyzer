# GitHub Profile Analyzer

GitHub Profile Analyzer is a lightweight front-end app for exploring GitHub users. It pulls public profile information from the GitHub API and presents a cleaner summary of a developer's account, repositories, language mix, and recent public activity.

## Features

- View profile details including avatar, bio, company, location, and account age
- See repository-level highlights such as stars, forks, issues, language, and recent updates
- Get a quick language breakdown based on public repositories
- Review recent public GitHub activity with working links back to the related repository or issue
- Analyze a profile directly from the browser without storing tokens in the codebase

## Project Structure

- `index.html` contains the application shell
- `style.css` defines the full visual design
- `script.js` handles API requests, sorting, rendering, and state updates

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Isaac-ek/github-profile-analyzer.git
   ```

2. Move into the project:

   ```bash
   cd github-profile-analyzer
   ```

3. Open `index.html` in a browser, or run any simple static file server.

## Usage

1. Enter any public GitHub username.
2. Click `Analyze Profile` or press `Enter`.
3. Review the generated profile summary, repository insights, and recent activity.

## Notes

- This app uses GitHub's public API and may hit unauthenticated rate limits if used heavily.
- No personal access token is required for the current version.

## Deployment

Because the app is fully static, it can be deployed easily to Vercel, GitHub Pages, Netlify, or any static host.

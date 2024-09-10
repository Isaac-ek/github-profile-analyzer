# GitHub Profile Analyzer

GitHub Profile Analyzer is a web application that allows users to analyze GitHub profiles. The application retrieves and displays user information, repositories, and recent activities of a specified GitHub user.

## Features

- **User Profile Information:** View basic details such as name, bio, avatar, and location.
- **Public Repositories:** List all public repositories along with their descriptions, stars, and forks.
- **Recent Activities:** Show recent activities of the user, including the type of activity and the timestamp.




## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- A GitHub account to generate a personal access token

### Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd your-repo-name
   ```

3. **Update Your Token in `script.js`:**
   - Open `script.js` in a text editor.
   - Replace `'YOUR_GITHUB_TOKEN'` with your actual GitHub token:

     ```javascript
     const token = 'YOUR_GITHUB_TOKEN'; // Replace with your GitHub token
     ```

4. **Open `index.html` in Your Web Browser:**
   - You can open the file directly in your browser or use a local server.

## Usage

1. Enter a GitHub username in the input field.
2. Click the "Analyze" button.
3. View the user profile information, repositories, and recent activities.

## Deployment

This project can be deployed using GitHub Pages or other static site hosting services.

### Deploying with GitHub Pages

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Pages**.
3. Choose the branch to deploy from (typically `main` or `master`).
4. Click **Save**.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the GitHub API for providing the data.
- Inspiration from various GitHub API examples and tutorials.

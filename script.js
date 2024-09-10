document.getElementById('analyze-btn').addEventListener('click', function () {
    const username = document.getElementById('username').value.trim();
    if (username) {
        // Placeholder for API call to GitHub
        alert(`Analyzing GitHub profile for: ${username}`);
    } else {
        alert('Please enter a GitHub username.');
    }
});

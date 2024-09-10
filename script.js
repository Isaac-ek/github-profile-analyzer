document.getElementById('analyze-btn').addEventListener('click', function () {
    const username = document.getElementById('username').value.trim();
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    if (username) {
        // Show loading indicator
        loadingDiv.style.display = 'block';

        // Fetch user profile data
        fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('User not found or rate limit exceeded');
            }
            return response.json();
        })
        .then(data => {
            displayUserData(data);
            // Fetch user repositories data
            return fetch(`https://api.github.com/users/${username}/repos`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }
            return response.json();
        })
        .then(repos => {
            displayRepositories(repos);
            // Fetch recent activity
            return fetch(`https://api.github.com/users/${username}/events`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return response.json();
        })
        .then(events => {
            displayRecentActivity(events);
        })
        .catch(error => {
            resultsDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
        })
        .finally(() => {
            // Hide loading indicator
            loadingDiv.style.display = 'none';
        });
    } else {
        resultsDiv.innerHTML = `<p style="color: red;">Please enter a GitHub username.</p>`;
    }
});

function displayUserData(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>${data.name || data.login}</h2>
        <img src="${data.avatar_url}" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%;">
        <p><strong>Bio:</strong> ${data.bio || 'N/A'}</p>
        <p><strong>Public Repos:</strong> ${data.public_repos}</p>
        <p><strong>Followers:</strong> ${data.followers}</p>
        <p><strong>Following:</strong> ${data.following}</p>
        <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
    `;
}

function displayRepositories(repos) {
    const resultsDiv = document.getElementById('results');
    let reposHtml = '<h3>Repositories:</h3><ul>';
    repos.forEach(repo => {
        reposHtml += `
            <li>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                <p>${repo.description || 'No description'}</p>
            </li>
        `;
    });
    reposHtml += '</ul>';
    resultsDiv.innerHTML += reposHtml;
}

function displayRecentActivity(events) {
    const resultsDiv = document.getElementById('results');
    let eventsHtml = '<h3>Recent Activity:</h3><ul>';
    events.slice(0, 5).forEach(event => {
        eventsHtml += `
            <li>
                <p><strong>${event.type}</strong> on <a href="${event.repo.html_url}" target="_blank">${event.repo.name}</a> ${new Date(event.created_at).toLocaleString()}</p>
            </li>
        `;
    });
    eventsHtml += '</ul>';
    resultsDiv.innerHTML += eventsHtml;
}

// background.js

function createGitHubRepo(repoName) {
    // Retrieve the access token from Chrome storage
    chrome.storage.sync.get(['accessToken'], function (result) {
      const token = result.accessToken;
  
      if (!token) {
        console.error("GitHub access token not found. Please log in.");
        return;
      }
  
      const url = `https://api.github.com/user/repos`;
      const repoData = {
        name: repoName,
        description: "Repository for LeetCode solutions",
        private: false // Set to true if you want to create a private repo
      };
  
      // Call the GitHub API to create the repository
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repoData)
      })
      .then(response => {
        if (response.ok) {
          return response.json();  // If response is OK, parse the JSON data
        } else {
          // Handle errors like 401 Unauthorized or 422 Unprocessable Entity (repo already exists)
          return response.json().then(err => {
            throw new Error(`${response.status} ${response.statusText}: ${err.message}`);
          });
        }
      })
      .then(data => {
        console.log("Repository created successfully:", data);
      })
      .catch(error => {
        console.error("Error creating repository:", error);
        if (error.message.includes("422")) {
          console.error("Repository may already exist. Please check the repository name.");
        } else if (error.message.includes("401")) {
          console.error("Authentication error. Please log in again.");
        }
      });
    });
  }
  
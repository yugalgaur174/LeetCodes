document.getElementById('login').addEventListener('click', () => {
    const clientId = 'your_github_client_id';  // Replace with your GitHub OAuth App Client ID
    const redirectUri = chrome.identity.getRedirectURL('oauth2');
  
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${redirectUri}`;
  
    // Launch the GitHub OAuth login flow
    chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    }, function (redirectedToUrl) {
      if (chrome.runtime.lastError || !redirectedToUrl) {
        console.error("OAuth error or no response");
        return;
      }
  
      // Extract the authorization code from the URL
      const urlParams = new URLSearchParams(new URL(redirectedToUrl).search);
      const code = urlParams.get('code');
  
      if (code) {
        // Exchange the code for an access token
        fetch(`https://github.com/login/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: 'your_github_client_secret',  // Replace with your GitHub OAuth App Client Secret
            code: code
          })
        })
        .then(response => response.json())
        .then(data => {
          const accessToken = data.access_token;
  
          // Store the access token using Chrome's storage
          chrome.storage.sync.set({ accessToken }, () => {
            console.log('GitHub Access Token stored successfully.');
          });
        });
      }
    });
  });
  
  document.getElementById('create-repo').addEventListener('click', () => {
    const repoName = prompt("Enter the name of the repository where your LeetCode solutions will be stored:", "leetcode-solutions");
  
    if (repoName) {
      chrome.storage.sync.set({ repoName }, () => {
        console.log('Repository name saved successfully.');
        createGitHubRepo(repoName); // Call the function to create the repository
      });
    }
  });
  
  function createGitHubRepo(repoName) {
    chrome.storage.sync.get(['accessToken'], function (result) {
      const token = result.accessToken;
      if (!token) {
        console.error("GitHub access token not found");
        return;
      }
  
      const url = `https://api.github.com/user/repos`;
  
      const repoData = {
        name: repoName,
        description: "Repository for LeetCode solutions",
        private: false
      };
  
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repoData)
      })
      .then(response => response.json())
      .then(data => {
        console.log("Repository created successfully:", data);
      })
      .catch(error => console.error("Error creating repository:", error));
    });
  }
  
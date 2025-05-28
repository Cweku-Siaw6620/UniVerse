function handleGoogleLogin(response) {
      const idToken = response.credential;

      fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      })
      .then(res => res.json())
      .then(data => {
        console.log("User authenticated:", data);
        // Save to localStorage if needed
        localStorage.setItem("user", JSON.stringify(data));
        // Redirect to store dashboard or homepage
        window.location.href = "../homepage.html";
      })
      .catch(err => {
        console.error("Google login failed:", err);
        alert("Login failed."); 
      });
    }
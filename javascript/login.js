function handleGoogleLogin(response) {
      const idToken = response.credential;

      fetch('https://universe-api-u0rj.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      })
      .then(res => res.json())
      .then(data => {
        console.log("User authenticated:", data);
        // Save to localStorage if needed
        try {
          localStorage.setItem("user", JSON.stringify(data));
        } catch (err) {
          console.error("Failed to save user to localStorage:", err);
        }
        // Redirect to store dashboard or index
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 500);

      })
      .catch(err => {
        console.error("Google login failed:", err);
        alert("Login failed."); 
      });
    }
    

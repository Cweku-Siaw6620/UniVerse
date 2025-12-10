function handleGoogleLogin(response) {
      const idToken = response.credential;

      fetch('https://universe-api-uabt.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      })
      .then(res => res.json())
      .then(data => {
        console.log("User authenticated:", data);
        // Save to localStorage if needed
        localStorage.setItem("user", JSON.stringify(data));
        // Redirect to store dashboard or index
        window.location.href = "../index.html";
/*
         // No redirection here — just log success
    console.log("Login successful, staying on current page for testing.");
    // Check immediately after
console.log('Local Storage Status:', localStorage.getItem('user'));
*/
      })
      .catch(err => {
        console.error("Google login failed:", err);
        alert("Login failed."); 
      });
    }
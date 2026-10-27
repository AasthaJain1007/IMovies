
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "";
    loginMessage.style.color = "#ff8585";

    if (!email || !password) {
        loginMessage.textContent = "Please fill in all fields.";
        return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');

    try {
        if (submitButton) submitButton.disabled = true;

        loginMessage.style.color = "#ffffff";
        loginMessage.textContent = "Logging in...";

        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.style.color = "#ff8585";
            loginMessage.textContent =
                data.message || "Login failed. Please try again.";
            return;
        }
         
        sessionStorage.setItem("authToken", data.token);

        sessionStorage.setItem("loggedInUser", JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
        }));

        loginMessage.style.color = "#65e6a0";
        loginMessage.textContent = "Login successful! Redirecting...";

        setTimeout(function() {
            const redirectPage = sessionStorage.getItem("redirectAfterLogin");

            if (redirectPage === "booking.html") {
                sessionStorage.removeItem("redirectAfterLogin");
                window.location.href = "booking.html";
            } else {
                window.location.href = "index.html";
            }
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);

        loginMessage.style.color = "#ff8585";
        loginMessage.textContent =
            "Cannot connect to server. Please try again.";

    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});


const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    registerMessage.textContent = "";
    registerMessage.style.color = "#ff8585";

    if (!name || !email || !password || !confirmPassword) {
        registerMessage.textContent = "Please fill in all fields.";
        return;
    }

    if (password.length < 8) {
        registerMessage.textContent = "Password must contain at least 8 characters.";
        return;
    }

    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match.";
        return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');

    try {
        if (submitButton) submitButton.disabled = true;

        registerMessage.style.color = "#ffffff";
        registerMessage.textContent = "Creating your account...";

        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            registerMessage.style.color = "#ff8585";
            registerMessage.textContent = data.message || "Registration failed.";
            return;
        }

        registerMessage.style.color = "#65e6a0";
        registerMessage.textContent =
            "Account created successfully! Redirecting to login...";

        registerForm.reset();

        setTimeout(function() {
            window.location.href = "login.html";
        }, 1200);

    } catch (error) {
        console.error("Registration error:", error);
        registerMessage.style.color = "#ff8585";
        registerMessage.textContent =
            "Cannot connect to server. Please try again.";
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});

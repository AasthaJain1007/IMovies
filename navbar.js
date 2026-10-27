
function updateNavbar() {
    const navAuth = document.getElementById("navAuth");

    if (!navAuth) return;

    const loggedInUser = JSON.parse(
        sessionStorage.getItem("loggedInUser")
    );

    if (loggedInUser) {
        navAuth.innerHTML = `
            <span class="nav-user">Hi, ${loggedInUser.name}</span>
            <button class="login-btn" id="logoutBtn">Logout</button>
        `;

        document.getElementById("logoutBtn").addEventListener("click", function() {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
        `;
    }
}

updateNavbar();

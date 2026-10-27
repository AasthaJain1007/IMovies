
const API_URL = "http://localhost:5000";

const token = sessionStorage.getItem("authToken");
let loggedInUser = {};

try {
  loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
} catch {
  loggedInUser = {};
}

let movies = [];
let messageTimer;

const $ = (id) => document.getElementById(id);

const dashboardSection = $("dashboardSection");
const moviesSection = $("moviesSection");
const movieModal = $("movieModal");
const movieForm = $("movieForm");

function showMessage(text, type = "success") {
  const box = $("message");
  box.textContent = text;
  box.className = `message show ${type}`;

  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    box.className = "message";
  }, 4500);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function posterHTML(url, title) {
  const safeTitle = escapeHTML(title);
  const safeURL = escapeHTML(url);

  return `<img src="${safeURL}" alt="${safeTitle} poster"
    onerror="this.onerror=null;this.src='https://placehold.co/300x420?text=No+Poster'">`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
      throw new Error("Your session expired. Please log in again.");
    }

    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }

  return data;
}

function requireAdmin() {
  if (!token || loggedInUser.role !== "admin") {
    alert("Please log in with an admin account to access this page.");
    window.location.replace("login.html");
    return false;
  }

  $("adminName").textContent = loggedInUser.name || "Administrator";
  return true;
}

function showSection(section) {
  const isDashboard = section === "dashboard";

  dashboardSection.hidden = !isDashboard;
  moviesSection.hidden = isDashboard;
  $("pageTitle").textContent = isDashboard ? "Admin Dashboard" : "Manage Movies";

  document.querySelectorAll(".nav-link[data-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === section);
  });

  if (!isDashboard) {
    renderMoviesTable();
  }
}

async function loadDashboard() {
  try {
    const data = await apiRequest("/api/admin/dashboard");

    // Supports either top-level stats or a nested stats object.
    const stats = data.stats || data.dashboard || data;

    $("totalUsers").textContent =
      stats.totalUsers ?? stats.userCount ?? stats.users ?? 0;

    $("totalBookings").textContent =
      stats.totalBookings ?? stats.bookingCount ?? stats.bookings ?? 0;

    $("confirmedBookings").textContent =
      stats.confirmedBookings ?? stats.confirmed ?? 0;

    if (data.admin?.name) {
      $("adminName").textContent = data.admin.name;
    }
  } catch (error) {
    showMessage(`Dashboard statistics: ${error.message}`, "error");
  }
}

async function loadMovies() {
  try {
    const data = await apiRequest("/api/movies");
    movies = Array.isArray(data) ? data : (data.movies || []);

    $("totalMovies").textContent = movies.length;
    renderRecentMovies();
    renderMoviesTable();
  } catch (error) {
    showMessage(`Could not load movies: ${error.message}`, "error");
    $("recentMovies").innerHTML =
      '<p class="empty-state">Could not load movies. Check that the backend is running.</p>';
    $("moviesTableBody").innerHTML =
      '<tr><td colspan="5" class="empty-state">Unable to load movies.</td></tr>';
  }
}

function renderRecentMovies() {
  const recentMovies = movies.slice(0, 4);

  if (!recentMovies.length) {
    $("recentMovies").innerHTML =
      '<p class="empty-state">No movies found. Add your first movie!</p>';
    return;
  }

  $("recentMovies").innerHTML = recentMovies.map((movie) => `
    <article class="movie-card">
      ${posterHTML(movie.poster, movie.title)}
      <div class="movie-card-info">
        <h3>${escapeHTML(movie.title)}</h3>
        <p>${escapeHTML(movie.genre)}</p>
        <p class="rating">★ ${escapeHTML(movie.rating)} / 10</p>
        <p>${escapeHTML(movie.language)}</p>
      </div>
    </article>
  `).join("");
}

function renderMoviesTable() {
  const search = $("movieSearch").value.trim().toLowerCase();

  const filteredMovies = movies.filter((movie) =>
    String(movie.title || "").toLowerCase().includes(search)
  );

  $("movieCount").textContent =
    `${filteredMovies.length} movie${filteredMovies.length === 1 ? "" : "s"}`;

  if (!filteredMovies.length) {
    $("moviesTableBody").innerHTML =
      '<tr><td colspan="5" class="empty-state">No matching movies found.</td></tr>';
    return;
  }

  $("moviesTableBody").innerHTML = filteredMovies.map((movie) => `
    <tr>
      <td>
        <div class="movie-cell">
          ${posterHTML(movie.poster, movie.title)}
          <span>${escapeHTML(movie.title)}</span>
        </div>
      </td>
      <td>${escapeHTML(movie.genre)}</td>
      <td>★ ${escapeHTML(movie.rating)}</td>
      <td>${escapeHTML(movie.language)}</td>
      <td>
        <div class="actions">
          <button class="secondary-btn" data-action="edit"
            data-id="${escapeHTML(movie._id)}">Edit</button>
          <button class="danger-btn" data-action="delete"
            data-id="${escapeHTML(movie._id)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openMovieModal(movie = null) {
  movieForm.reset();

  $("movieId").value = movie?._id || "";
  $("formTitle").textContent = movie ? "Edit Movie" : "Add New Movie";
  $("saveMovieBtn").textContent = movie ? "Update Movie" : "Save Movie";

  if (movie) {
    $("title").value = movie.title || "";
    $("genre").value = movie.genre || "";
    $("rating").value = movie.rating ?? "";
    $("language").value = movie.language || "";
    $("poster").value = movie.poster || "";
  }

  movieModal.hidden = false;
  $("title").focus();
}

function closeMovieModal() {
  movieModal.hidden = true;
}

async function saveMovie(event) {
  event.preventDefault();

  const id = $("movieId").value;

  const movieData = {
    title: $("title").value.trim(),
    genre: $("genre").value.trim(),
    rating: Number($("rating").value),
    language: $("language").value.trim(),
    poster: $("poster").value.trim()
  };

  if (
    !movieData.title ||
    !movieData.genre ||
    !movieData.language ||
    !movieData.poster ||
    !Number.isFinite(movieData.rating) ||
    movieData.rating < 0 ||
    movieData.rating > 10
  ) {
    showMessage("Please enter valid details for every field.", "error");
    return;
  }

  const saveButton = $("saveMovieBtn");
  saveButton.disabled = true;
  saveButton.textContent = id ? "Updating..." : "Saving...";

  try {
    await apiRequest(
      id ? `/api/admin/movies/${encodeURIComponent(id)}` : "/api/admin/movies",
      {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(movieData)
      }
    );

    closeMovieModal();
    showMessage(id ? "Movie updated successfully!" : "Movie added successfully!");

    await loadMovies();
    await loadDashboard();
    showSection("movies");
  } catch (error) {
    showMessage(`Could not save movie: ${error.message}`, "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = id ? "Update Movie" : "Save Movie";
  }
}

async function deleteMovie(id) {
  const movie = movies.find((item) => item._id === id);

  if (!movie) {
    showMessage("Movie not found. Refresh and try again.", "error");
    return;
  }

  const confirmed = confirm(
    `Are you sure you want to delete "${movie.title}"? This cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await apiRequest(`/api/admin/movies/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    showMessage(`"${movie.title}" deleted successfully.`);
    await loadMovies();
    await loadDashboard();
  } catch (error) {
    showMessage(`Could not delete movie: ${error.message}`, "error");
  }
}

// Sidebar navigation
document.querySelectorAll(".nav-link[data-section]").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

// Dashboard and movie actions
$("addMovieBtn").addEventListener("click", () => openMovieModal());
$("addMovieTopBtn").addEventListener("click", () => openMovieModal());

$("viewAllBtn").addEventListener("click", () => showSection("movies"));

$("movieSearch").addEventListener("input", renderMoviesTable);
movieForm.addEventListener("submit", saveMovie);

$("closeModalBtn").addEventListener("click", closeMovieModal);
$("cancelModalBtn").addEventListener("click", closeMovieModal);

movieModal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close-modal")) {
    closeMovieModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !movieModal.hidden) {
    closeMovieModal();
  }
});

$("moviesTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const movie = movies.find((item) => item._id === button.dataset.id);
  if (!movie) return;

  if (button.dataset.action === "edit") {
    openMovieModal(movie);
  } else if (button.dataset.action === "delete") {
    deleteMovie(movie._id);
  }
});

$("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
});

// Start the admin dashboard
if (requireAdmin()) {
  loadDashboard();
  loadMovies();
}


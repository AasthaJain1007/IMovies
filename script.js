
const movies = [
    {
        id: 1,
        title: "Inception",
        genre: "Sci-Fi / Thriller",
        rating: 8.8,
        language: "English",
        poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
    },
    {
        id: 2,
        title: "Interstellar",
        genre: "Sci-Fi / Drama",
        rating: 8.7,
        language: "English",
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
        id: 3,
        title: "Jawan",
        genre: "Action / Thriller",
        rating: 7.0,
        language: "Hindi",
        poster: "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg"
    },
    {
        id: 4,
        title: "Pathaan",
        genre: "Action / Thriller",
        rating: 5.8,
        language: "Hindi",
        poster: "https://image.tmdb.org/t/p/w500/arf00BkwvXo0CFKbaD9Lq2NMVxf.jpg"
    },
    {
        id: 5,
        title: "The Batman",
        genre: "Action / Crime",
        rating: 7.8,
        language: "English",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"
    },
    {
        id: 6,
        title: "Dangal",
        genre: "Drama / Sports",
        rating: 8.3,
        language: "Hindi",
        poster: "https://image.tmdb.org/t/p/w500/5c1l0M9wZ9s7G8f4m4nY5F7p.jpg"
    },
    {
        id: 7,
        title: "Avengers: Endgame",
        genre: "Action / Adventure",
        rating: 8.4,
        language: "English",
        poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
    },
    {
        id: 8,
        title: "3 Idiots",
        genre: "Comedy / Drama",
        rating: 8.4,
        language: "Hindi",
        poster: "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg"
    }
];

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");

// Display movie cards
function displayMovies(movieList) {
    movieGrid.innerHTML = "";

    if (movieList.length === 0) {
        movieGrid.innerHTML = "<p>No movies found. Try another title.</p>";
        return;
    }

    movieList.forEach(function (movie) {
        const movieCard = document.createElement("article");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img
                src="${movie.poster}"
                alt="${movie.title} poster"
                loading="lazy"
            >

            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.genre} · ${movie.language}</p>

                <div class="movie-rating">
                    ★ ${movie.rating}/10
                </div>

                <button class="book-btn" data-movie-id="${movie.id}">
                    Book Tickets
                </button>
            </div>
        `;

        movieGrid.appendChild(movieCard);
    });
}

// Search movies by title
searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredMovies = movies.filter(function (movie) {
        return movie.title.toLowerCase().includes(searchText);
    });

    displayMovies(filteredMovies);
});

// Handle Book Tickets buttons
movieGrid.addEventListener("click", function (event) {
    const button = event.target.closest(".book-btn");

    if (!button) return;

    const movieId = Number(button.dataset.movieId);

    const selectedMovie = movies.find(function (movie) {
        return movie.id === movieId;
    });

   if (selectedMovie) {
    sessionStorage.setItem(
        "selectedMovie",
        JSON.stringify(selectedMovie)
    );

    window.location.href = "movie.html";
}
});

// Show all movies when the homepage opens
displayMovies(movies);


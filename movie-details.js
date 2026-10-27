
const selectedMovieJSON = sessionStorage.getItem("selectedMovie");
const movieDetails = document.getElementById("movieDetails");

const showtimes = ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"];

if (!selectedMovieJSON) {
    movieDetails.innerHTML = `
        <h2>No movie selected</h2>
        <p style="margin-top: 15px; color: #b7b7c8;">
            Please select a movie from the home page first.
        </p>
        <a href="index.html#movies" class="primary-btn"
           style="margin-top: 25px;">
            Explore Movies
        </a>
    `;
} else {
    const movie = JSON.parse(selectedMovieJSON);

    movieDetails.innerHTML = `
        <div class="details-layout">
            <div>
                <img
                    class="details-poster"
                    src="${movie.poster}"
                    alt="${movie.title} poster"
                >
            </div>

            <div class="details-info">
                <p class="tagline">NOW SHOWING</p>

                <h1>${movie.title}</h1>

                <div class="details-meta">
                    ★ ${movie.rating}/10
                    &nbsp; | &nbsp; ${movie.genre}
                    &nbsp; | &nbsp; ${movie.language}
                </div>

                <p class="details-description">
                    Experience ${movie.title} on the big screen.
                    Discover the story, enjoy the cinematic experience,
                    and book your tickets for your preferred showtime.
                </p>

                <h3>Select Showtime</h3>

                <div class="showtime-list">
                    ${showtimes.map((time, index) => `
                        <button
                            class="showtime-btn ${index === 0 ? "selected" : ""}"
                            data-time="${time}"
                            type="button"
                        >
                            ${time}
                        </button>
                    `).join("")}
                </div>

                <p class="details-price">
                    Ticket price: <strong>₹200</strong> per ticket
                </p>

                <button class="primary-btn" id="bookTickets" type="button">
                    Book Tickets
                </button>
            </div>
        </div>
    `;

    let selectedShowtime = showtimes[0];

    const showtimeButtons = document.querySelectorAll(".showtime-btn");

    showtimeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            showtimeButtons.forEach(function (item) {
                item.classList.remove("selected");
            });

            button.classList.add("selected");
            selectedShowtime = button.dataset.time;
        });
    });

    document.getElementById("bookTickets").addEventListener("click", function () {
        sessionStorage.setItem(
            "bookingDetails",
            JSON.stringify({
                movie: movie,
                showtime: selectedShowtime,
                ticketPrice: 200
            })
        );

        window.location.href = "booking.html";
    });
}

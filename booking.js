const loggedInUser = JSON.parse(
    sessionStorage.getItem("loggedInUser") || "null"
);

if (!loggedInUser) {
    sessionStorage.setItem("redirectAfterLogin", "booking.html");
    window.location.href = "login.html";
}

const bookingContent = document.getElementById("bookingContent");

const bookingJSON = sessionStorage.getItem("bookingDetails");

if (!bookingJSON) {
    bookingContent.innerHTML = `
        <h2>No booking selected</h2>
        <p style="margin: 15px 0; color: #b7b7c8;">
            Please select a movie and showtime first.
        </p>
        <a href="index.html#movies" class="primary-btn">
            Explore Movies
        </a>
    `;
} else {
    const booking = JSON.parse(bookingJSON);
    const movie = booking.movie;
    const ticketPrice = Number(booking.ticketPrice);

    bookingContent.innerHTML = `
        <div class="booking-card">
            <div>
                <img
                    class="booking-poster"
                    src="${movie.poster}"
                    alt="${movie.title} poster"
                >
            </div>

            <div class="booking-form">
                <h2>${movie.title}</h2>

                <p style="color: #c084fc; margin-top: 10px;">
                    ${movie.genre} · ${movie.language}
                </p>

                <p style="color: #b7b7c8; margin-top: 12px;">
                    Showtime: <strong id="selectedShowtime"></strong>
                </p>

                <form id="ticketForm">
                    <label for="customerName">Full Name</label>
                    <input
                        type="text"
                        id="customerName"
                        required
                        maxlength="80"
                        placeholder="Enter your name"
                    >

                    <label for="customerEmail">Email Address</label>
                    <input
                        type="email"
                        id="customerEmail"
                        required
                        maxlength="254"
                        placeholder="Enter your email"
                    >

                    <label for="ticketCount">Number of Tickets</label>
                    <select id="ticketCount">
                        <option value="1">1 Ticket</option>
                        <option value="2">2 Tickets</option>
                        <option value="3">3 Tickets</option>
                        <option value="4">4 Tickets</option>
                        <option value="5">5 Tickets</option>
                        <option value="6">6 Tickets</option>
                    </select>

                    <div class="booking-total">
                        <p>Price per ticket: ₹${ticketPrice}</p>
                        <p>Number of tickets: <span id="countDisplay">1</span></p>
                        <h2>Total: ₹<span id="totalPrice">${ticketPrice}</span></h2>
                    </div>

                    <button type="submit" class="confirm-btn">
                        Confirm Demo Booking
                    </button>

                    <p id="bookingMessage" aria-live="polite"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById("selectedShowtime").textContent =
        booking.showtime;

    const ticketCount = document.getElementById("ticketCount");
    const totalPrice = document.getElementById("totalPrice");
    const countDisplay = document.getElementById("countDisplay");
    const bookingMessage = document.getElementById("bookingMessage");

    ticketCount.addEventListener("change", function () {
        const count = Number(ticketCount.value);

        countDisplay.textContent = count;
        totalPrice.textContent = count * ticketPrice;
    });


document.getElementById("ticketForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerName =
        document.getElementById("customerName").value.trim();

    const customerEmail =
        document.getElementById("customerEmail").value.trim().toLowerCase();

    const count = Number(ticketCount.value);

    const loggedInUser = JSON.parse(
        sessionStorage.getItem("loggedInUser") || "null"
    );

    if (!loggedInUser || !loggedInUser.id) {
        bookingMessage.style.color = "#ff8585";
        bookingMessage.textContent = "Please login again before booking.";
        return;
    }

    const submitButton = document.querySelector(
        '#ticketForm button[type="submit"]'
    );

    try {
        if (submitButton) submitButton.disabled = true;

        bookingMessage.style.color = "#ffffff";
        bookingMessage.textContent = "Saving your booking...";

        const response = await fetch("http://localhost:5000/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                userEmail: loggedInUser.email,
                movieId: String(movie.id),
                movieTitle: movie.title,
                poster: movie.poster,
                showtime: booking.showtime,
                customerName,
                customerEmail,
                numberOfTickets: count
            })
        });

        const data = await response.json();

        if (!response.ok) {
            bookingMessage.style.backgroundColor = "#4a2020";
            bookingMessage.style.color = "#ff8585";
            bookingMessage.textContent =
                data.message || "Booking failed. Please try again.";
            return;
        }

        bookingMessage.className = "booking-message";
        bookingMessage.style.backgroundColor = "#173a2b";
        bookingMessage.style.color = "#a7f3d0";

        bookingMessage.textContent =
            "Booking successful! Reference: " +
            data.booking.bookingReference +
            ". No payment has been collected.";

    } catch (error) {
        console.error("Booking error:", error);

        bookingMessage.style.color = "#ff8585";
        bookingMessage.textContent =
            "Cannot connect to server. Please try again.";

    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});

}

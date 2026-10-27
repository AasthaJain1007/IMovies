
const bookingsList = document.getElementById("bookingsList");

console.log(
    "Logged-in user:",
    JSON.parse(sessionStorage.getItem("loggedInUser") || "null")
);

const loggedInUser = JSON.parse(
    sessionStorage.getItem("loggedInUser") || "null"
);

if (!loggedInUser || !loggedInUser.id) {
    window.location.href = "login.html";
} else {
    displayBookings();
}

async function getBookings() {
    const response = await fetch(
        `http://localhost:5000/api/bookings/${encodeURIComponent(loggedInUser.id)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings.");
    }

    return data.bookings;
}

async function displayBookings() {
    bookingsList.innerHTML = `<p>Loading your bookings...</p>`;

    try {
        const bookings = await getBookings();

        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="no-bookings">
                    <h2>No Bookings Yet 🎬</h2>
                    <p>You haven't booked any movie tickets yet.</p>
                    <a href="index.html" class="explore-movies-btn">
                        Explore Movies
                    </a>
                </div>
            `;
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <img
                    src="${booking.poster || "https://placehold.co/300x450?text=Movie"}"
                    alt="${booking.movieTitle}"
                    class="booking-poster"
                >

                <div class="booking-info">
                    <h2>${booking.movieTitle}</h2>

                    <p><strong>Booking ID:</strong> ${booking.bookingReference}</p>
                    <p><strong>Showtime:</strong> ${booking.showtime}</p>
                    <p><strong>Name:</strong> ${booking.customerName}</p>
                    <p><strong>Email:</strong> ${booking.customerEmail}</p>
                    <p><strong>Tickets:</strong> ${booking.numberOfTickets}</p>
                    <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>

                    <span class="booking-status"
                        style="${booking.status === "Cancelled"
                            ? "background:#482126;color:#ff8585;"
                            : ""}">
                        ${booking.status}
                    </span>

                    ${
                        booking.status !== "Cancelled"
                        ? `<br>
                           <button
                               class="cancel-booking-btn"
                               data-booking-id="${booking.bookingReference}">
                               Cancel Booking
                           </button>`
                        : ""
                    }
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Fetch bookings error:", error);

        bookingsList.innerHTML = `
            <div class="no-bookings">
                <h2>Unable to Load Bookings</h2>
                <p>Please check your connection and try again.</p>
                <button class="explore-movies-btn" id="retryBookings">
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retryBookings").addEventListener(
            "click",
            displayBookings
        );
    }
}

bookingsList.addEventListener("click", async function(event) {
    const button = event.target.closest(".cancel-booking-btn");

    if (!button) return;

    const bookingId = button.dataset.bookingId;

    const confirmCancel = confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    button.disabled = true;

    try {
        const response = await fetch(
            `http://localhost:5000/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: loggedInUser.id
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to cancel booking.");
            button.disabled = false;
            return;
        }

        await displayBookings();

    } catch (error) {
        console.error("Cancel booking error:", error);
        alert("Cannot connect to server. Please try again.");
        button.disabled = false;
    }
});

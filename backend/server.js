
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Booking = require("./models/Booking");
const Movie = require("./models/Movie");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { authenticateToken, requireAdmin } = require("./middleware/auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("IMovies Backend is running!");
});


// ==============================
// ADMIN DASHBOARD API
// ==============================

app.get(
    "/api/admin/dashboard",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalBookings = await Booking.countDocuments();

            const confirmedBookings = await Booking.countDocuments({
                status: "Confirmed"
            });

            const cancelledBookings = await Booking.countDocuments({
                status: "Cancelled"
            });

            res.json({
                message: "Admin dashboard data fetched successfully.",
                admin: {
                    name: req.user.name,
                    email: req.user.email
                },
                stats: {
                    totalUsers,
                    totalBookings,
                    confirmedBookings,
                    cancelledBookings
                }
            });
        } catch (error) {
            console.error("Admin dashboard error:", error.message);

            res.status(500).json({
                message: "Could not load admin dashboard."
            });
        }
    }
);


// ==============================
// MOVIE APIs
// ==============================

// Get all movies (public)
app.get("/api/movies", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        console.error("Fetch movies error:", error.message);

        res.status(500).json({
            message: "Could not fetch movies."
        });
    }
});


// Add a movie (admin only)
app.post(
    "/api/admin/movies",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const { title, genre, rating, language, poster } = req.body;

            if (
                typeof title !== "string" || !title.trim() ||
                typeof genre !== "string" || !genre.trim() ||
                rating === undefined || rating === "" ||
                typeof language !== "string" || !language.trim() ||
                typeof poster !== "string" || !poster.trim()
            ) {
                return res.status(400).json({
                    message: "Please provide all movie details."
                });
            }

            const numericRating = Number(rating);

            if (
                !Number.isFinite(numericRating) ||
                numericRating < 0 ||
                numericRating > 10
            ) {
                return res.status(400).json({
                    message: "Rating must be between 0 and 10."
                });
            }

            const movie = await Movie.create({
                title: title.trim(),
                genre: genre.trim(),
                rating: numericRating,
                language: language.trim(),
                poster: poster.trim()
            });

            res.status(201).json({
                message: "Movie added successfully.",
                movie
            });
        } catch (error) {
            console.error("Add movie error:", error.message);

            res.status(500).json({
                message: "Could not add movie."
            });
        }
    }
);


// Edit a movie (admin only)
app.patch(
    "/api/admin/movies/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, genre, rating, language, poster } = req.body;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    message: "Invalid movie ID."
                });
            }

            const updates = {};

            if (title !== undefined) {
                if (typeof title !== "string" || !title.trim()) {
                    return res.status(400).json({
                        message: "Title cannot be empty."
                    });
                }
                updates.title = title.trim();
            }

            if (genre !== undefined) {
                if (typeof genre !== "string" || !genre.trim()) {
                    return res.status(400).json({
                        message: "Genre cannot be empty."
                    });
                }
                updates.genre = genre.trim();
            }

            if (language !== undefined) {
                if (typeof language !== "string" || !language.trim()) {
                    return res.status(400).json({
                        message: "Language cannot be empty."
                    });
                }
                updates.language = language.trim();
            }

            if (poster !== undefined) {
                if (typeof poster !== "string" || !poster.trim()) {
                    return res.status(400).json({
                        message: "Poster URL cannot be empty."
                    });
                }
                updates.poster = poster.trim();
            }

            if (rating !== undefined) {
                const numericRating = Number(rating);

                if (
                    rating === "" ||
                    !Number.isFinite(numericRating) ||
                    numericRating < 0 ||
                    numericRating > 10
                ) {
                    return res.status(400).json({
                        message: "Rating must be between 0 and 10."
                    });
                }

                updates.rating = numericRating;
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: "Provide at least one field to update."
                });
            }

            const movie = await Movie.findByIdAndUpdate(
                id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!movie) {
                return res.status(404).json({
                    message: "Movie not found."
                });
            }

            res.json({
                message: "Movie updated successfully.",
                movie
            });
        } catch (error) {
            console.error("Update movie error:", error.message);

            res.status(500).json({
                message: "Could not update movie."
            });
        }
    }
);


// Delete a movie (admin only)
app.delete(
    "/api/admin/movies/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    message: "Invalid movie ID."
                });
            }

            const movie = await Movie.findByIdAndDelete(id);

            if (!movie) {
                return res.status(404).json({
                    message: "Movie not found."
                });
            }

            res.json({
                message: "Movie deleted successfully."
            });
        } catch (error) {
            console.error("Delete movie error:", error.message);

            res.status(500).json({
                message: "Could not delete movie."
            });
        }
    }
);


// ==============================
// REGISTER API
// ==============================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});


// ==============================
// LOGIN API
// ==============================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});


// ==============================
// BOOKING APIs
// ==============================

// Create a booking
app.post("/api/bookings", async (req, res) => {
    try {
        const {
            userId,
            userEmail,
            movieId,
            movieTitle,
            poster,
            showtime,
            customerName,
            customerEmail,
            numberOfTickets
        } = req.body;

        if (
            !userId ||
            !mongoose.isValidObjectId(userId) ||
            !userEmail ||
            !movieId ||
            !movieTitle ||
            !showtime ||
            !customerName ||
            !customerEmail ||
            !Number.isInteger(numberOfTickets) ||
            numberOfTickets < 1 ||
            numberOfTickets > 6
        ) {
            return res.status(400).json({
                message: "Please provide valid booking details."
            });
        }

        const user = await User.findById(userId);

        if (!user || user.email !== userEmail.trim().toLowerCase()) {
            return res.status(401).json({
                message: "Please login with a valid account."
            });
        }

        const ticketPrice = 200;
        const totalPrice = ticketPrice * numberOfTickets;

        const newBooking = await Booking.create({
            bookingReference:
                "IM" + Date.now().toString().slice(-8) +
                Math.floor(Math.random() * 1000),
            userId: user._id,
            userEmail: user.email,
            movieId: String(movieId),
            movieTitle: movieTitle.trim(),
            poster: poster || "",
            showtime,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            numberOfTickets,
            totalPrice
        });

        res.status(201).json({
            message: "Booking saved successfully!",
            booking: newBooking
        });
    } catch (error) {
        console.error("Booking error:", error.message);

        res.status(500).json({
            message: "Unable to save booking. Please try again."
        });
    }
});


// Get bookings for a user
app.get("/api/bookings/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const bookings = await Booking.find({
            userId: userId
        }).sort({ createdAt: -1 });

        console.log("Requested user ID:", userId);
        console.log("Bookings found:", bookings.length);

        res.status(200).json({ bookings });
    } catch (error) {
        console.error("Fetch bookings error:", error.message);

        res.status(500).json({
            message: "Unable to fetch bookings."
        });
    }
});


// Cancel a booking
app.patch("/api/bookings/:bookingReference/cancel", async (req, res) => {
    try {
        const { bookingReference } = req.params;
        const { userId } = req.body;

        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const booking = await Booking.findOne({
            bookingReference: bookingReference,
            userId: userId
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found."
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                message: "This booking is already cancelled."
            });
        }

        booking.status = "Cancelled";
        await booking.save();

        res.status(200).json({
            message: "Booking cancelled successfully.",
            booking
        });
    } catch (error) {
        console.error("Cancel booking error:", error.message);

        res.status(500).json({
            message: "Unable to cancel booking."
        });
    }
});


// ==============================
// CONNECT TO MONGODB AND START SERVER
// ==============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`IMovies server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

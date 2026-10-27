
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    bookingReference: {
        type: String,
        required: true,
        unique: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    movieId: {
        type: String,
        required: true
    },

    movieTitle: {
        type: String,
        required: true
    },

    poster: {
        type: String,
        default: ""
    },

    showtime: {
        type: String,
        required: true
    },

    customerName: {
        type: String,
        required: true,
        trim: true
    },

    customerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    numberOfTickets: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);

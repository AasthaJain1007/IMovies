
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "demo@gmail.com";

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            console.log("User not found. Check the registered email.");
            return;
        }

        user.role = "admin";
        await user.save();

        console.log(`Admin role assigned to: ${user.email}`);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

makeAdmin();

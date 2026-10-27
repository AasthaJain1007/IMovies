
require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/Movie");

const movies = [
  {
    title: "Inception",
    genre: "Sci-Fi / Thriller",
    rating: 8.8,
    language: "English",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  },
  {
    title: "Interstellar",
    genre: "Sci-Fi / Drama",
    rating: 8.7,
    language: "English",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },
  {
    title: "Jawan",
    genre: "Action / Thriller",
    rating: 7.0,
    language: "Hindi",
    poster: "https://image.tmdb.org/t/p/w500/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg"
  },
  {
    title: "Pathaan",
    genre: "Action / Thriller",
    rating: 5.8,
    language: "Hindi",
    poster: "https://image.tmdb.org/t/p/w500/arf00BkwvXo0CFKbaD9Lq2NMVxf.jpg"
  },
  {
    title: "The Batman",
    genre: "Action / Crime",
    rating: 7.8,
    language: "English",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"
  },
  {
    title: "Dangal",
    genre: "Drama / Sports",
    rating: 8.3,
    language: "Hindi",
    poster: "https://image.tmdb.org/t/p/w500/5c1l0M9wZ9s7G8f4m4nY5F7p.jpg"
  },
  {
    title: "Avengers: Endgame",
    genre: "Action / Adventure",
    rating: 8.4,
    language: "English",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
  },
  {
    title: "3 Idiots",
    genre: "Comedy / Drama",
    rating: 8.4,
    language: "Hindi",
    poster: "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg"
  }
];

async function seedMovies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");

    for (const movie of movies) {
      await Movie.findOneAndUpdate(
        { title: movie.title },
        { $set: movie },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log("Movies added/updated successfully!");
    console.log(`Total movies processed: ${movies.length}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ju1bs.mongodb.net/?retryWrites=true&w=majority`;
console.log('MongoDB URI:', uri);

// Create a MongoClient with MongoClientOptions
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Access the collections
    const movieCollection = client.db('movieDB').collection('movie');
    const favoritesCollection = client.db('movieDB').collection('favorites');

    // -------------------------------
    // Movie Routes
    // -------------------------------

    // GET: Fetch all movies
    app.get('/movie', async (req, res) => {
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET: Fetch a single movie by ID
    app.get('/movie/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid movie ID format!' });
      }

      try {
        const movie = await movieCollection.findOne({ _id: new ObjectId(id) });

        if (movie) {
          res.status(200).send(movie);
        } else {
          res.status(404).send({ error: 'Movie not found!' });
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).send({ error: 'An error occurred while fetching the movie.' });
      }
    });

    // POST: Add a new movie
    app.post('/movie', async (req, res) => {
      const newMovie = req.body;

      try {
        const result = await movieCollection.insertOne(newMovie);
        res.status(201).send(result);
      } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).send({ error: 'An error occurred while adding the movie.' });
      }
    });

    // PUT: Update a movie by ID
    app.put('/movie/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid movie ID format!' });
      }

      const updatedMovie = req.body;

      // Remove `_id` from the update payload it cant be changed
      delete updatedMovie._id;

      try {
        const result = await movieCollection.updateOne(
          { _id: new ObjectId(id) }, // Filter by ID
          { $set: updatedMovie }     // Update fields
        );

        if (result.matchedCount > 0) {
          res.status(200).send({ message: 'Movie updated successfully!' });
        } else {
          res.status(404).send({ error: 'Movie not found!' });
        }
      } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).send({ error: 'An error occurred while updating the movie.' });
      }
    });

    // DELETE: Remove a movie by ID
    app.delete('/movie/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid movie ID format!' });
      }

      try {
        const result = await movieCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
          res.status(200).send({ message: 'Movie deleted successfully!' });
        } else {
          res.status(404).send({ error: 'Movie not found!' });
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).send({ error: 'An error occurred while deleting the movie.' });
      }
    });

    // -------------------------------
    // Favorites Routes
    // -------------------------------

    // POST: Add a movie to favorites
    app.post('/favorites', async (req, res) => {
      const favoriteMovie = req.body;

      try {
        const result = await favoritesCollection.insertOne(favoriteMovie);
        res.status(201).send({ message: 'Movie added to favorites successfully!', result });
      } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).send({ error: 'An error occurred while adding to favorites.' });
      }
    });
    


    // GET: Fetch favorite movies by email
    app.get('/favorites', async (req, res) => {
      const { email } = req.query;
      console.log('Email:', email); // Log the email to check if it's received

      if (!email) {
        return res.status(400).send({ error: 'Email is required to fetch favorites.' });
      }

      try {
        const favorites = await favoritesCollection.find({ email }).toArray();
        res.status(200).send(favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).send({ error: 'An error occurred while fetching favorites.' });
      }
    });

    // DELETE: Remove a favorite movie by ID
    app.delete('/favorites/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid favorite ID format!' });
      }

      try {
        const result = await favoritesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
          res.status(200).send({ message: 'Favorite movie removed successfully!' });
        } else {
          res.status(404).send({ error: 'Favorite movie not found!' });
        }
      } catch (error) {
        console.error('Error removing favorite movie:', error);
        res.status(500).send({ error: 'An error occurred while removing the favorite movie.' });
      }
    });

    // -------------------------------
    // Ping to Test Connection
    // -------------------------------
    await client.db('admin').command({ ping: 1 });
    console.log('Connected to MongoDB successfully!');
  } finally {
    // Ensure proper cleanup
    // await client.close();
  }
}
run().catch(console.error);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

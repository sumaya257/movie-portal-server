const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ju1bs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    // Access the movie collection
    const movieCollection = client.db('movieDB').collection('movie');

    // GET: Fetch all movies
    app.get('/movie', async (req, res) => {
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST: Add a new movie
    app.post('/movie', async (req, res) => {
      const newMovie = req.body;
      console.log(newMovie);
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });

    // GET: Find a specific movie by ID
    app.get('/movie/:id', async (req, res) => {
      const { id } = req.params;

      try {
        // Convert the id to ObjectId
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

    // DELETE: Remove a movie by ID
    app.delete('/movie/:id', async (req, res) => {
      const { id } = req.params;

      try {
        // Convert the id to ObjectId
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

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

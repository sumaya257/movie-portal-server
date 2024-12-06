const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())


console.log(process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ju1bs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //server to database
    const movieCollection = client.db('movieDB').collection('movie')
    //after creating now read the data
    app.get('/movie',async(req,res)=>{
        const cursor = movieCollection.find()
        const result = await cursor.toArray()
        res.send(result)
        
    })
    //client to server
    app.post('/movie',async(req,res)=>{
        const newMovie = req.body
        console.log(newMovie)
        const result = await movieCollection.insertOne(newMovie)
        res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('server is running')
})
app.listen(port,()=>{
    console.log(`coffee server is running on port${port}`)
})
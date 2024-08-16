const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://ahmedshohagarfan:HPgOhkFFhPvUXgvv@cluster0.x6ipdw6.mongodb.net/?appName=Cluster0";
// const uri = "mongodb://localhost:27017"

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("FilterFlow").collection("Products");

    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;
      // const sortByDate = req.query.sortByDate;

      let query = {
        productName: { $regex: search, $options: "i" },
      };

      if (filter) query.category = filter;

      let sortOptions = {};

      // Sorting by price
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      // Sorting by date
      // if (sortByDate) {
      //   sortOptions.createdAt = sortByDate === "asc" ? 1 : -1;
      // }
      const result = await productsCollection
        .find(query)
        .sort(sortOptions)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/products-count", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        productName: { $regex: search, $options: "i" },
      };

      if (filter) query.category = filter;
      const count = await productsCollection.countDocuments(query);
      res.send({ count });
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Money is Coming");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

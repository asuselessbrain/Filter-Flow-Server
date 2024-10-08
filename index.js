const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://filter-flow.netlify.app"
    ]
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6ipdw6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const productsCollection = client.db("FilterFlow").collection("Products");

    app.get("/products", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;
      const sortByDate = req.query.sortByDate;
      const minPrice = parseFloat(req.query.minPrice); // Minimum price filter
      const maxPrice = parseFloat(req.query.maxPrice);
      const brand = req.query.brand

      let query = {
        productName: { $regex: search, $options: "i" },
      };

      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else if (!isNaN(minPrice)) {
        query.price = { $gte: minPrice };
      } else if (!isNaN(maxPrice)) {
        query.price = { $lte: maxPrice };
      }

      if (filter) query.category = filter;
      if (brand) {
        query.brand = brand;
      }

      let sortOptions = {};
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      if (sortByDate) {
        sortOptions.createdAt = sortByDate === "asc" ? 1 : -1;
      }

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
      const minPrice = parseFloat(req.query.minPrice); // Minimum price filter
      const maxPrice = parseFloat(req.query.maxPrice);
      const brand = req.query.brand

      let query = {
        productName: { $regex: search, $options: "i" },
      };
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else if (!isNaN(minPrice)) {
        query.price = { $gte: minPrice };
      } else if (!isNaN(maxPrice)) {
        query.price = { $lte: maxPrice };
      }
      if (brand) {
        query.brand = brand;
      }

      if (filter) query.category = filter;
      const count = await productsCollection.countDocuments(query);
      res.send({ count });
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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

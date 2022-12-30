const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require("mongodb");
const uri = `mongodb+srv://adminUser1:${process.env.MONGODB_PASSWORD}@cluster0.sqgzvsr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// collections
const usersCollection = client.db("twitch").collection("users");
const postCollection = client.db("twitch").collection("posts");

async function run() {
  try {
    // create user
    app.post("/createUser", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // get all user
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    // get user by email
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // update user
    app.put("/update_user", async (req, res) => {
      const email = req.query.email;
      const { name, education, address, photo } = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name,
          education,
          address,
          profile_picture: photo,
        },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //  add post
    app.post("/addPost", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.send(result);
    });
    // get all post
    app.get("/newsFeedPost", async (req, res) => {
      const query = {};
      const result = await (await postCollection.find(query))
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });
    // like post
    app.put("/like/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const filter = await postCollection.findOne(query);
      const options = { upsert: true };
      if (filter?.like) {
        const newLike = filter.like + 1;
        const like = {
          $set: {
            like: newLike,
          },
        };
        const result = await postCollection.updateOne(query, like, options);
        return res.send(result);
      }
      const like = {
        $set: {
          like: 1,
        },
      };
      const result = await postCollection.updateOne(query, like, options);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Twitch server is working");
});
app.listen(port, () => {
  console.log(`server running on ${port}`);
});

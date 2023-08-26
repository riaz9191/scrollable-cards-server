const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const multer = require("multer");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uri = "mongodb+srv://scroll-card:gOcSXTyrkjCP71lK@cluster0.3onslcg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);


app.get("/upload", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("fileuploads");
        const collection = db.collection("attachments");

        const result = await collection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error retrieving files:", error);
        res.status(500).json({ error: "An error occurred while retrieving files" });
    } finally {
        // client.close();
    }
});
app.get("/getFiles", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("fileuploads");
    const collection = db.collection("attachments");

    const result = await collection.find().toArray();
    res.json(result);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "An error occurred while fetching files" });
  } finally {
    // client.close();
  }
});

// Handle file uploads
app.post("/upload", upload.array("files"), async (req, res) => {
    const files = req.files;
  
    try {
      await client.connect();
      const db = client.db("fileuploads");
      const collection = db.collection("attachments");
      
      const fileDocuments = files.map(file => ({
        name: file.originalname,
        data: file.buffer
      }));
      
      const result = await collection.insertMany(fileDocuments);
  
      res.json({ message: `${result.insertedCount} files uploaded successfully` });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "An error occurred while uploading files" });
    } finally {
    //   client.close();
    }
  });
app.get('/', (req, res) => {
    res.send("Server is running on port " + port);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

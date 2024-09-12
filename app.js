const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

app.use(express.json());

app.use(cors({
  origin: '*', // You can restrict this to your frontend URL later for security
  methods: ['GET', 'POST'],
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use("/files", express.static(path.join(__dirname, "files"))); // Serve static files from 'files' directory

// MongoDB connection
const mongoUrl = "mongodb+srv://demo:demo123@cluster0.0lhtqkg.mongodb.net/demo?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
})
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.error("Error connecting to database", e);
  });

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Importing the schema for PDF details
require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");

// POST endpoint to upload files
app.post("/upload-files", upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const fileName = req.file.filename;

  console.log("Uploaded file details:", req.file);

  if (!title || !fileName) {
    return res.status(400).json({ status: "error", message: "Missing title or file" });
  }

  try {
    await PdfSchema.create({ title, pdf: fileName });
    res.status(201).send({ status: "ok", message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ status: "error", message: "Failed to upload file" });
  }
});

// GET endpoint to fetch all PDF files
app.get("/get-files", async (req, res) => {
  try {
    const data = await PdfSchema.find({});
    res.status(200).send({ status: "ok", data });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send({ status: "error", message: "Failed to retrieve files" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Success!!!!!!");
});

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});

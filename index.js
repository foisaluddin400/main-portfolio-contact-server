const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlk7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();


    const myPortfolioContact = client.db("myPortfolioContact")
    const contactCollection = myPortfolioContact.collection("contactEmail")



    app.post("/contact", async (req, res) => {
        const { name, email, message } = req.body;
        console.log("Form Data Received:", { name, email, message });
        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ success: false, error: "Invalid email address." });
        }
        // Nodemailer Setup
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
          },
        });
        const mailOptions = {
          from: email,
          to: process.env.EMAIL_USER,
          subject: `New Contact Form Message from ${name}`,
          text: `You have received a new message from:
          Name: ${name}
          Email: ${email}
          Message: ${message}`,
        };
        try {
          // Insert the contact message into the MongoDB collection
          const contactMessage = {
            name,
            email,
            message,
            createdAt: new Date(), // Add a timestamp
          };
          
          await contactCollection.insertOne(contactMessage);
      
          // Send the email
          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent:", info);
          
          res.status(200).json({ success: true });
        } catch (error) {
          console.error("Error sending email or saving to database:", error);
          res.status(500).json({ success: false, error: error.message });
        }
      });








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('portfolio is running')
});
app.listen(port, () => {
    console.log(`Server started on port${port}`);
});




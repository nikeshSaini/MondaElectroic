const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejs = require("ejs");
const fs = require("fs");
const multer = require("multer"); // Add multer for file upload handling
const userDetails = require('./models/userDetails'); 
var session = require('express-session')
const app = express();
const port = 3000;

app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // to apply ejs
app.set("views", path.join(__dirname, "views")); 
app.use(express.static(path.join(__dirname, "public")));


//database connection setup
const mongo_url = "mongodb://127.0.0.1:27017/clientElectric";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(mongo_url);
}


//first step user registration

app.post("/register", async (req, res) => {
  try {
    const userData = req.body.userData;

    // Create a new user document
    const newUser = new userDetails({
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();
    res.redirect('/login');
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json(`${ error}`);
  }
});

// Configure multer for file upload handling
const storage = multer.diskStorage({
  destination: 'public/uploads/', 
  filename: (req, file, cb) => { // Corrected the callback arguments
    cb(null, file.originalname); // Use the original filename
  }
});

let upload = multer({
  storage: storage
});



//to show items
app.get("/preview", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.render("preview", { listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Error fetching listings");
  }
});

app.get("/userPreview", async (req, res) => {
  try {
    const listings = await userDetails.find({});
    res.render("userPreview", { listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Error fetching listings");
  }
});

//post data after submiting the form

// Post data after submitting the feedback form
app.post("/feedback", upload.single('pageImg'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const feedbackData = req.body.feedback;
    const img = req.file.filename;
    const feedbackItem = new Listing({
      userId: feedbackData.userId,
      venue: feedbackData.venue,
      description: feedbackData.description,
      img: img,
      expenditure: feedbackData.expenditure,
      location: feedbackData.location
    });

    await feedbackItem.save();
    res.status(201).send("Feedback submitted successfully");
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).send("Error saving feedback: " + error.message);
  }
});









//login credential post route
app.post("/login", async(req,res)=>{
  const { email, password } = req.body;
  try {
    const userCred = await userDetails.findOne({ email });

    if (!userCred) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userCred.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    req.session.userCred = userCred; // Storing the object userCred in session
    res.redirect('/user');
  } catch(error) {
    res.status(500).json({ message: "Internal server error" });
  }
});




// Logout route
app.get("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error destroying session");
    } else {
      // Redirect the user to the login page after logout
      res.redirect("/login");
    }
  });
});


// Default route
app.get('/', (req, res) => {
  // Check if user is logged in (userCred exists in session)
  if (req.session.userCred) {
    // User is logged in, render the landing page
    res.render("landingPage.ejs", { userCred: req.session.userCred });
  } else {
    // User is not logged in, render the login page
    res.render("login.ejs");
  }
});


//login route

app.get("/login" ,(req, res)=>{
  res.render("login.ejs");
})


//login user landing page
app.get('/user', (req, res) => {
  const userCred = req.session.userCred; // Retrieving userCred from session
  if (!userCred) {
      return res.redirect('/login'); // Redirect to login if not authenticated
  }
  res.render("landingPage.ejs", { userCred });
});

// /register
app.get("/register", (req,res)=>{
  res.render("userForm.ejs");
});
//feedback

app.get('/feedback', (req, res) => {
  const userCred = req.session.userCred; // Retrieving userCred from session
  if (!userCred) {
      return res.redirect('/login'); // Redirect to login if not authenticated
  }
  res.render('index', { userCred });
});

//preview feedback
app.get('/view/feedback', async(req,res)=>{
  const userCred = req.session.userCred; // Retrieving userCred from session
  const currId =userCred._id;
  const feedbacks = await Listing.find({userId : currId});
  res.render("showFeedback.ejs",{feedbacks});
})

app.listen(port, (req, res)=>{
    console.log("app is listening" + port);
});
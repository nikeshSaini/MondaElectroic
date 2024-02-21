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

app.post("/listings", upload.single('pageImg'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const listingData = req.body.listing;
    const img = req.file.filename;
    const listingItem = new Listing({
      venue: listingData.venue,
      description: listingData.description,
      img: img,
      expenditure: listingData.expenditure,
      location: listingData.location
    });
    await listingItem.save();
    const listings = await Listing.find({});
    res.render("preview", { listings });
  } catch (error) {
    console.error("Error saving listing:", error);
    res.status(500).send("Error saving listing: " + error.message);
  }


});

//registration
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

    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json(`${ error}`);
  }
});
//user/attendance/id

app.get("/user/:id", (req, res)=>{
  const {id} = req.params;
  
})

//login user landing page

app.get('/user', (req, res) => {
  const userCred = req.session.userCred; // Retrieving userCred from session
    res.render("landingPage.ejs", { userCred });
});



//login post route

app.post("/login", async(req,res)=>{
    const {email,password} = req.body;
    try{
      const userCred = await userDetails.findOne({email});

      if(!userCred){
        return res.status(404).json({message:"User not found"});
      }

      if(userCred.password !== password){
        return res.status(401).json({message:"incorrect password"});
      }

      req.session.userCred = userCred; // Storing userCred in session
      res.redirect('/user');

    }catch(error){
      res.status(500).json({ message: "Internal server error" });
    }

});


//login route

app.get("/login" ,(req, res)=>{
  res.render("login.ejs");
})


app.get("/register", (req,res)=>{
  res.render("userForm.ejs");
})

app.get("/", (req,res)=>{
    res.render("index.ejs");
})

app.listen(port, (req, res)=>{
    console.log("app is listening" + port);
})
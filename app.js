require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const userDetails = require('./models/userDetails'); 
const WorkSession = require("./models/attendance.js");
const ejs = require("ejs");
const fs = require("fs");
const multer = require("multer"); // Add multer for file upload handling
var session = require('express-session')
const app = express();
const port = process.env.PORT ;
const adminDetails = require("./models/adminDetails.js");
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
 
main()
  .then(() => { 
    console.log("connected to DB");
    // console.log(process.env.MONGO_URL);
  })
  .catch((err) => {
    console.log(err);
  });
async function main() { 
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: 'Monad_Electronics',
  });
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

app.post('/start', async (req, res) => {
  try {
    // Create a new work session document with the starting time and location
    const sessionData = req.body.session;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;

    const newWorkSession = new WorkSession({
      userId: sessionData.userId,
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // Note: longitude first, then latitude
      }
    });

    // Save the document to the database
    await newWorkSession.save();
    
    res.send('Starting time recorded.');
  } catch (error) {
    console.error('Error recording starting time:', error);
    res.status(500).send('Error recording starting time.');
  }
});

app.post('/end', async (req, res) => {
  try {
    // Find the latest work session and update its ending time
    const sessionData =req.body.session;
    const latestSession = await WorkSession.findOne().sort({startTime: -1});
    if (!latestSession) {
      return res.status(404).send('No active work session found.');
    }
    latestSession.endTime = new Date();
    await latestSession.save();
    res.send('Ending time recorded.');
  } catch (error) {
    console.error('Error recording ending time:', error);
    res.status(500).send('Error recording ending time.');
  }
});

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
    res.redirect('/user');
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).send("Error saving feedback: " + error.message);
  }
});
app.get("/userlist",async (req,res)=>{
  const userList =  await userDetails.find({});
  res.render("userslist.ejs", {userList});
})

app.get('/admin', (req, res) => {
  const adminCred = req.session.adminCred; // Retrieving userCred from session
  if (!adminCred) {
      return res.redirect('/adminlogin'); // Redirect to login if not authenticated
  }
  res.render("adminLanding.ejs", { adminCred });
});

//admin login post route
const adminData = {
  fullName: 'Kshrip Kumar',
  email: 'admin5693@gmail.com',
  password: 'admin@5693'
};
app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminCred = await adminDetails.findOne({ email });

    if (!adminCred) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (adminCred.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    req.session.adminCred = adminCred; // Storing the admin credentials in session
    res.redirect('/admin');
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error" });
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
//admin login

app.get("/adminlogin",(req,res)=>{
  res.render("adminLogin.ejs");
})
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
  if (!userCred) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  const currId =userCred._id;
  const currUserName = userCred.fullName;
  const feedbacks = await Listing.find({userId : currId});
  res.render("showFeedback.ejs",{feedbacks,currUserName});
}); 
//feedback via admin
app.get('/view/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userDetails.findById(id); // Assuming userDetails is your user model
    const currUserName = user.fullName;
    const feedbacks = await Listing.find({ userId: id }); 
    res.render("showFeedback", { feedbacks, currUserName });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).send("Error fetching feedback");
  }
});

//attendance via admin
app.get('/view/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const worksession = await WorkSession.find({ userId: id }); // Assuming userId field is used to identify the user in the WorkSession model
    res.render("preview", { worksession });
  } catch (error) {
    console.error("Error fetching work session:", error);
    res.status(500).send("Error fetching work session");
  }
});


//attendance page route
app.get('/view/attendance', async(req,res)=>{
  const userCred = req.session.userCred; // Retrieving userCred from session
  if (!userCred) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  const currId =userCred._id;
  const worksession = await WorkSession.find({ userId: currId }).sort({ startTime: 1 });
  res.render("preview.ejs",{worksession});
}); 

app.get('/attendance',(req,res)=>{
  const userCred = req.session.userCred;// Retrieving userCred from session
  res.render('showattendance.ejs',{userCred});
})

// app.get('/location',(req,res)=>{
//   res.render('getcurrent.ejs');
// })
app.listen(port, (req, res)=>{
    console.log("app is listening" + port);
});


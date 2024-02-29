require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const UserDetails = require("../models/userDetails.js");
const WorkSession =require("../models/attendance.js");
const adminDetails = require("../models/adminDetails.js")


//database connection

main()
  .then(() => { 
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
  async function main() { 
    try {
      await mongoose.connect(process.env.MONGO_URL, {
        dbName: 'Monad_Electronics',
      });
      console.log("Connected to DB");
    } catch (error) {
      console.error("Error connecting to DB:", error);
    }
  }
  
  

const initDB = async () => {
  try {
    // Delete existing data
    await UserDetails.deleteMany({});
    await Listing.deleteMany({});
    await WorkSession.deleteMany({});
    await adminDetails.deleteMany({});

    ///insert admin details
    await adminDetails.create({
      fullName:'Kshrip Kumar',
      email:'admin5693@gmail.com',
      password:"admin@5693"
    });

    // Insert user
    const user = await UserDetails.create({
      fullName: 'Nikesh Saini',
      email: 'nikeshsplash@gmail.com',
      password: 'qwerty@123'
    });

    // Create listing associated with the user
    await Listing.create({
      userId: user._id, // Associate the listing with the user
      venue: "hotel",
      description: "having good time",
      img: "null",
      expenditure: 3000,
      location: "jaipur"
    }); 


    const startTime = new Date(); // Current date and time
    const endTime = null; 

    //initialize the worksession
    await WorkSession.create({
      userId: user._id,
      startTime: startTime,
      endTime: endTime,
    });


    console.log("Data is initialized");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};
initDB();
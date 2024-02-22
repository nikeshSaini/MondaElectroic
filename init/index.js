require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const UserDetails = require("../models/userDetails.js");
const WorkSession =require("../models/attendance.js");


//database connection

main()
  .then(() => { 
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() { 

  await mongoose.connect( process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Monad_Electronics',
  });
  
}

const initDB = async () => {
  try {
    // Delete existing data
    await UserDetails.deleteMany({});
    await Listing.deleteMany({});
    await WorkSession.deleteMany({});

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

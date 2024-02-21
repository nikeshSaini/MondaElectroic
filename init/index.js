const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const UserDetails = require("../models/userDetails.js");

const mongo_url = "mongodb://127.0.0.1:27017/clientElectric";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

const initDB = async () => {
  try {
    // Delete existing data
    await UserDetails.deleteMany({});
    await Listing.deleteMany({});

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

    console.log("Data is initialized");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { UserModel } from "./models/User.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { HubModel } from "./models/Hub.js";
import { DriverModel, generateDriverId} from "./models/Driver.js";
import axios from "axios";

const app = express();
const port = process.env.PORT || 4040;
const bcryptSalt = bcrypt.genSaltSync(10);

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

const jwtSecret = process.env.JWT_SECRET;

app.use(cors({
  credentials: true,
  methods:["POST", "GET"],
  origin: process.env.CLIENT_URL
}));

app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get('/profile', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json("Invalid token");
      }
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});


app.post("/login/user", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const foundUser = await UserModel.findOne({ username, role });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOK = await bcrypt.compare(password, foundUser.password);
    if (!passOK) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    jwt.sign({ userId: foundUser._id, username, role: foundUser.role }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: foundUser._id,
        role: foundUser.role,
      })
    });
  }
  catch (err) {
    console.error("Login error:", err);
    next(err);
  }
})

app.post("/login/admin", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const foundUser = await UserModel.findOne({ username, role });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOK = await bcrypt.compare(password, foundUser.password);
    if (!passOK) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // console.log('Input Password:', password);
    // console.log('Stored Password Hash:', foundUser.password);
    // console.log('Password Comparison Result:', passOK);

    jwt.sign({ userId: foundUser._id, username, role: foundUser.role }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: foundUser._id,
        role: foundUser.role,
      })
    });
  }
  catch (err) {
    console.error("Login error:", err);
    next(err);
  }
})

app.post("/login/driver", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const foundUser = await UserModel.findOne({ username, role });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOK = await bcrypt.compare(password, foundUser.password);
    if (!passOK) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // console.log('Input Password:', password);
    // console.log('Stored Password Hash:', foundUser.password);
    // console.log('Password Comparison Result:', passOK);

    jwt.sign({ userId: foundUser._id, username, role: foundUser.role }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: foundUser._id,
        role: foundUser.role,
      })
    });
  }
  catch (err) {
    console.error("Login error:", err);
    next(err);
  }
})

app.post("/register/user", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(req.body);
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ username, role: 'user' });

    if (existingUser) {
      // User is already registered
      return res.status(400).json({ error: "User already registered. Try logging in." });
    }

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const createUser = await UserModel.create({
      username: username,
      password: hashedPassword,
      role: role || 'user',
    });

    jwt.sign({ userId: createUser._id, username, role: 'user' }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: createUser._id,
        role: createUser.role,
      });
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post("/register/admin", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(req.body);
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ username, role: 'admin' });

    if (existingUser) {
      // User is already registered
      return res.status(400).json({ error: "User already registered. Try logging in." });
    }

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const createAdmin = await UserModel.create({
      username: username,
      password: hashedPassword,
      role: role || 'admin',
    });

    jwt.sign({ userId: createAdmin._id, username, role: 'admin' }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: createAdmin._id,
        role: createAdmin.role,
      });
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// app.post("/register/driver", async (req, res) => {
//   try {
//     const { username, password, role } = req.body;
//     console.log(req.body);
//     // Check if the user already exists
//     const existingUser = await UserModel.findOne({ username, role: 'driver' });

//     if (existingUser) {
//       // User is already registered
//       return res.status(400).json({ error: "User already registered. Try logging in." });
//     }

//     // Generate a new driver ID
//     const driverId = await generateDriverId();
//     console.log("driverid : ", driverId);
//     const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

//     const createDriver = await UserModel.create({
//       username: username,
//       password: hashedPassword,
//       role: role || 'driver',
//     });

//     // Save the new driver record with the generated driver ID
//     const newDriver = new DriverModel({
//       driverId,
//       name: username,
//       location: {
//         type: "Point",
//         coordinates: [] // Default coordinates
//       }
//     });

//     await newDriver.save();

//     // Return the driverID in the response
//     res.status(201).json({ driverId });

//     jwt.sign({ userId: createDriver._id, username, role: 'driver' }, jwtSecret, {}, (err, token) => {
//       if (err) throw err;
//       res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
//         id: createDriver._id,
//         role: createDriver.role,
//         driverId
//       });
//     })
//   } catch (err) {
//     console.error("Error during registration:", err);
//     res.status(500).json({ error: "Internal server error. Please try again later." });
//   }
// })
// var driverId;
app.post("/register/driver", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    console.log(req.body);

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ username, role: 'driver' });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered. Try logging in." });
    }

    // Generate a new driver ID
    const driverId = await generateDriverId();
    console.log("driverid : ", driverId);

    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const createDriver = await UserModel.create({
      username: username,
      password: hashedPassword,
      role: role || 'driver',
    });

    // Save the new driver record with the generated driver ID
    const newDriver = new DriverModel({
      driverId,
      name: username,
      location: {
        type: "Point",
        coordinates: [] // Default coordinates
      }
    });

    await newDriver.save();

    // Sign JWT token
    jwt.sign({ userId: createDriver._id, username, role: 'driver' }, jwtSecret, {}, (err, token) => {
      if (err) {
        console.error("Error signing JWT token:", err);
        return res.status(500).json({ error: "Error signing JWT token" });
      }

      // Return the driver ID and token in the response
      res.cookie("token", token, { sameSite: "none", secure: true }).status(201).json({
        id: createDriver._id,
        role: createDriver.role,
        // driverId,
        token
      });

    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: err.message || "Internal server error. Please try again later." });
  }
});

// For extracting Username
app.use((req, res, next) => {
  // Extract the token from the cookie
  const token = req.cookies?.token;

  if (token) {
    // Verify the token and extract user data
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json("Invalid token");
      }

      // Attach the username to the request object
      req.username = userData.username;
      next();
    });
  } else {
    res.status(401).json("No token");
  }
});

app.get("/register/driver", async (req, res) => {
  const { username } = req;
  console.log(username);
  const driver = await DriverModel.findOne({name: username});
  console.log("driverid : ", driver.driverId);
  // res.json(driver.driverId);
  res.json({ driverId: driver.driverId });
});

app.get("/admin-dashboard", async (req, res) => {
  try {
    // const username = req.body.admin;
    const { username } = req;
    console.log(username);
    // Fetch data from the database (assuming you are using Mongoose)
    const data = await HubModel.find({ admin: username });
    // console.log(data);
    // Send the fetched data as a response
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post("/admin-dashboard/submit", async (req, res) => {
  console.log("submitted");
  try {
    const formData = req.body;

    // Create a new driver document using the DriverModel
    const newHub = await HubModel.create({
      hub: formData.hub,
      admin: formData.admin,
      driverId: formData.driverId,
      trackingIds: formData.trackingIds,
      hubContact: formData.hubContact,
      nextHub: formData.nextHub
    });

    // Send a response indicating success
    res.status(201).json({ message: "Dilevery Hub added successfully", hub: newHub });
  } catch (error) {
    console.error("Error adding Dilevery Hub:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

//User Page
app.post("/user-dashboard/track", async (req, res) => {
  try {
    const { trackingId } = req.body;
    console.log(trackingId);

    if (!trackingId) {
      return res.status(400).json({ error: "Tracking ID is required" });
    }

    const driver = await HubModel.findOne({ trackingIds: trackingId }).exec();
    console.log(driver);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found for the provided tracking ID" });
    }

    const { driverId } = driver;
    console.log(driverId);
    if (!driverId) {
      return res.status(404).json({ error: "Driver ID not found for the provided tracking ID" });
    }

    const driverLocation = await DriverModel.findOne({ driverId:driverId });
    console.log(driverLocation);
    if (!driverLocation) {
      return res.status(404).json({ error: "Driver location not found" });
    }

    const driverCoordinates = driverLocation.location.coordinates;
    console.log(driverCoordinates);
    res.status(200).json({ driverId, driverCoordinates });
  } catch (error) {
    console.error("Error fetching driver information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Make a reverse geocoding request to obtain address information
// const apiKey = 'e2d7d69da1a0480296746e251cffc5db'; // Replace with your Geoapify API key
// const apiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${driverCoordinates[1]}&lon=${driverCoordinates[0]}&apiKey=${apiKey}`;
// const response = await axios.get(apiUrl);

// // Extract address information from the response
// const address = response.data.features[0].properties;
// console.log(address);
// // Construct the response with driver information and address
// const responseData = {
//   driverId,
//   driverCoordinates,
//   address
// };

// res.status(200).json(responseData);
// } catch (error) {
// console.error("Error fetching driver information:", error);
// res.status(500).json({ error: "Internal Server Error" });
// }
// });

// app.get("/user-dashboard/track", async (req, res) => {});

//Driver

app.post("/driver-dashboard/location", async (req, res) => {
  const { driverId, latitude, longitude, name } = req.body;
  console.log(longitude, latitude);

  try {
    let driver = await DriverModel.findOne({ driverId });

    if (!driver) {
      driver = new DriverModel({
        driverId,
        name,
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      });
    } else {
      driver.location.coordinates = [longitude, latitude];
    }

    await driver.save();

    res.status(200).json({ message: "Location updated successfully." });
  } catch (error) {
    console.error("Error occurred while updating location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
})

// Add a logout route
app.get("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("token").status(200).json({ message: "Logout successful" });
});

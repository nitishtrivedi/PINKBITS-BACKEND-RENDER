//-------ROUTES------

//Import Users Model from models
const { User } = require("../models/user-model.js");
//Require the ExpressJS library in the Users Route
const express = require("express");
//Initialize the route
const router = express.Router();
//INclude bcryptjs for password hashing. Can be commented out if no pwd hashing is needed
const bcrypt = require("bcryptjs");
//Include jsonwebtoken for sending token with the user for authentication
const jwt = require("jsonwebtoken");

//Creating routes. Default API route is http://localhost:300/api/v1/
router.get(`/`, async (req, res) => {
  const usersList = await User.find().select("-passwordHash"); // Remove .select('-passwordHash') if pwd hashing needs to be removed

  if (!usersList) {
    res.status(500).json({ success: false });
  }
  res.send(usersList);
});

//GET individual user
//Use User.findById(req.params.id).select('name phone email'); to display individual fields to frontend. New API needs to be created
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash"); // Remove .select('-passwordHash') if pwd hashing needs to be removed;

  if (!user) {
    res
      .status(500)
      .send(
        "The user could not be found. Please checck ID and error logs, and try again"
      );
  }
  res.status(200).send(user);
});

//Post to API
router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    passwordHash: bcrypt.hashSync(req.body.password, 10), // Add req.body.passwordHash and remove existing if no pwd hashing is needed
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    pin: req.body.pin,
  });

  user = await user.save();

  if (!user) {
    return res.status(400).send("The user cannot be created. Please try again");
  }
  res.status(200).send(user);
});

//REGISTER USER - Added on 24/11/22

router.post(`/register`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    color: req.body.color,
    passwordHash: bcrypt.hashSync(req.body.password, 10), // Add req.body.passwordHash and remove existing if no pwd hashing is needed
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    addressLine1: req.body.addressLine1,
    addressLine2: req.body.addressLine2,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    pin: req.body.pin,
  });

  user = await user.save();

  if (!user) {
    return res.status(400).send("The user cannot be created. Please try again");
  }
  res.status(200).send(user);
});

//Update the user WITHOUT the password being recorded. Can be modified to save the password as well.
router.put("/:id", async (req, res) => {
  //If the user updates the password, the following code will execute
  const userExist = await User.findById(req.params.id);

  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  //Main code
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      color: req.body.color,
      phone: req.body.phone,
      passwordHash: newPassword,
      isAdmin: req.body.isAdmin,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      pin: req.body.pin,
    },
    { new: true }
  );

  if (!user) {
    return res
      .status(500)
      .send(
        "The user cannot be updated. Check ID or mandatory fields. Check error log"
      );
  }

  res.status(200).send(user);
});

//Create a post request to send Useranme/Email and password to server for authentication
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret_for_jwt; //Call secret key from .env file
  if (!user) {
    return res
      .status(400)
      .send(
        "The user was not found. Please check email address and error logs"
      );
  }

  //Check if input password is correct
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    //if the user is authenticated, pass JWT web token
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );

    //Send email, token and message to the frontend
    res
      .status(200)
      .send({
        user: user.email,
        token: token,
        message: "User is Authenticated",
      });
  } else {
    res
      .status(400)
      .send("User Authentication Failed. Check Password and try again");
  }
  //res.status(200).send(user) //Use if need to return userdata
});

//DELETE a user
router.delete("/:id", async (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(200).send("The user was deleted successfully");
      } else {
        return res
          .status(404)
          .send("The User was not found. Please check ID and error logs");
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

//GET Users count
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments(); //Remove (count) => count from User.countDocuments

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

//DELETE a user
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

//Export the router to the app.js file
module.exports = router;

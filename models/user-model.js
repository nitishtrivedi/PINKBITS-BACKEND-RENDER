//--SCHEMAS--
//Create Users Schema. Refer Mongoose Documentation for more
//Call the Mongoose library for the Product Schema

const mongoose = require("mongoose");

//Define the schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    required: true,
    type: String,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  addressLine1: {
    type: String,
    default: "",
  },
  addressLine2: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  pin: {
    type: String,
    default: "",
  },
});

//Change the '_id' to 'id' for better front end functionality
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

//Exporting the model
exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;

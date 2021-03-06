const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const validator = require('validator');
const AppError = require("../utils/appError");

const UserSchema=mongoose.Schema({
    user_id:{
        type:String,
        required:true,
        unique:true,
        maxLength:[5,"user Id not more than 5 characters"]
    },
    user_name:{
        type:String,
        required:true,
        maxLength: [20, "user name should not exceed 20 characters"],
        minLength: [3, "user name should be 3 or more characters long"],
    },
    role_name:{
        type:String,
        required:true,
        enum:["Student","Admin","Teacher"]
      },
      role_description:{
        type:String,
        required:true,
      },
    user_email:{
        type:String,
        required:true,
        unique: true,
        validate: {
          validator: function(v) {
            return /^[a-z0-9](\.?[a-z0-9]){5,}@gmail\.com$/.test(v);
          },
          message: "Email incorrect"
        },
    },
    user_contactNo:{
        type:Number,
        required:true,
        validate: {
          validator: function(v) {
           return /^\d{10}$/.test(v)
          },
          message: "ContactNo format XXXXXXXXXX"
        },
    },
    user_address:{
        type:String,
        required:true,
        maxLength: [100, "user Address should not exceed 100 characters"],
        minLength: [10, "user Address should be 10 or more characters long"],

    },
    user_username:{
        type:String,
        required:true,
        unique:true
    },
    user_password:{
        type:String,
        required:true,
        validate: {
          validator: function(v) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(v);
          },
          message: "Password should contain 1 uppercase, 1 lowercase , 1 digit, 1 special character"
        },
    },
    resetToken: {
      type: String
  },
  expireToken: {
      type: Date
  }
})
//------------hashing the password----------------
UserSchema.pre("save", async function (next) {
  if (!this.isModified('user_password'))
   return next();
    const salt = await bcrypt.genSalt(10);
    this.user_password = await bcrypt.hash(this.user_password, salt);
    next();
  });
//compare password
UserSchema.methods.matchPassword = async function (Password) {
    return await bcrypt.compare(Password, this.user_password);
};
//----Create Collection in Database
const User = mongoose.model("User", UserSchema);
module.exports = User;
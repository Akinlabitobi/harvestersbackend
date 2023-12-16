const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email address"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid emaial",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Your password must ne up to 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Please enter user phone number!!!!"],
    },
    address: {
      type: String,
      required: [true, "Enter your address"],
    },
    designation: {
      type: String,
      enum: [
        "HOD",
        "Cell Leader",
        "Zonal Leaders",
        "Assistant HOD",
        "Community Leaders",
        "District Pastors",
        "Campus Pastor",
        "Team Heads",
        "Sub Team Heads",
        "Assistant Campus Pastor",
      ],
      required: [true, "Please select a desgination"],
    },
    team: {
      type: String,
      enum: [
        "Pastoral",
        "Finance",
        "General Service",
        "Maturity",
        "Membership",
        "Missions",
        "Ministry",
        "NextGen",
        "Programms",
        "Small Group",
      ],
      required: [true, "Please select a team"],
    },
    department: {
      type: String,
      enum: [
        "Pastoral",
        "Finance",
        "General Service",
        "Maturity",
        "Membership",
        "Missions",
        "Ministry",
        "NextGen",
        "Programms",
        "Small Group",
      ],
      required: [true, "Please select a department"],
    },
    name_of_next_of_kin: {
      type: String,
      required: [true, "Please input a next of kin"],
    },
    contact_of_next_of_kin: {
      type: String,
      required: [true, "Please input contact for next of kin"],
    },
    address_of_next_of_kin: {
      type: String,
      required: [true, "Please input address for next of kin"],
    },
    image: {
      type: String,
      required: [true, "Please add a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    role: {
      type: String,
      required: [true],
      default: "admin",
      enum: ["worker", "admin"],
    },
  },
  {
    timestamps: true,
  }
);
//encryption of password before saving to database
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;

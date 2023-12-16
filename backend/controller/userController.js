const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    designation,
    team,
    department,
    name_of_next_of_kin,
    contact_of_next_of_kin,
    address_of_next_of_kin,
  } = req.body;

  console.log(req.body);

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !designation ||
    !team ||
    !department ||
    !name_of_next_of_kin ||
    !contact_of_next_of_kin ||
    !address
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least six characters");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  const newUser = new User({
    name,
    email,
    password,
    phone,
    address,
    designation,
    team,
    department,
    name_of_next_of_kin,
    contact_of_next_of_kin,
    address_of_next_of_kin,
  });

  // Set the uploaded file path (assuming 'image' is the name attribute in the form)
  newUser.image = req.file ? req.file.path : "default_image_path";

  // Save the user to the database
  await newUser.save();

  // Generate token
  const token = generateToken(newUser._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  const { _id, image } = newUser;
  res.status(201).json({
    _id,
    name,
    email,
    image,
    role,
    token,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  //generate token
  const token = generateToken(user._id);
  if (passwordIsCorrect) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //1 day
      sameSite: "none",
      secure: true,
    });
  }
  if (user && passwordIsCorrect) {
    const { _id, name, email, image, role } = user;
    res.status(200).json({
      _id,
      name,
      email,
      image,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

//logout user

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "User successfully logged out" });
});

//get user
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, email, image, role, designation, team, department } =
      user;
    res.status(200).json({
      _id,
      name,
      email,
      role,
      image,
      designation,
      team,
      department,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

//login status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  //verify token
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (verifiedToken) {
    return res.json(true);
  }
  return res.json(false);
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, role, image, designation, team, department } = user;
    //user.email = email;
    user.name = req.body.name || name;
    user.designation = req.body.designation || designation;
    user.team = req.body.team || team;
    user.department = req.body.department || department;
    //user._id = req.body._id || _id;
    user.image = req.body.image || image;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      //email: updatedUser.email,
      image: updatedUser.image,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// ADMIN FUNCTIONALITY
// Controller for admin to create a user
const createAdminUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    designation,
    team,
    department,
    name_of_next_of_kin,
    contact_of_next_of_kin,
    address_of_next_of_kin,
  } = req.body;

  console.log(req.body);

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !designation ||
    !team ||
    !department ||
    !name_of_next_of_kin ||
    !contact_of_next_of_kin ||
    !address_of_next_of_kin
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  // Check if the logged-in user is an admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to create a user");
  }

  // Check if the email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  // Create a new user
  const newUser = new User({
    name,
    email,
    password,
    phone,
    address,
    designation,
    team,
    department,
    name_of_next_of_kin,
    contact_of_next_of_kin,
    address_of_next_of_kin,
  });

  // Save the user to the database
  await newUser.save();

  // Generate token
  const token = generateToken(newUser._id);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  const { _id } = newUser;
  res.status(201).json({
    _id,
    name,
    email,
    role: newUser.role,
    token,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// Controller for admin to delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check if the logged-in user is an admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete a user");
  }

  // Delete the user
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User deleted successfully" });
});

// Controller for admin to update a user
const updateAdminUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const {
    name,
    email,
    password,
    designation,
    team,
    department,
    // ... other user properties
  } = req.body;

  // Check if the logged-in user is an admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update a user");
  }

  // Find and update the user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name,
      email,
      password,
      designation,
      team,
      department,
    },
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(updatedUser);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  createAdminUser,
  getAllUsers,
  deleteUser,
  updateAdminUser,
};

/* {
  657cec07995aee05f2091b29
  "email": "dax@gmail.com.com",
  "password": "Demilade123"
}
  "name": "Demilade",
  "email": "demilade@gmail.com",
  "password": "Demilade123",
  "phone": 08155966106,
  "address": "Demilade",
  "designation": "HOD",
  "team": "Pastoral",
  "department": "Pastoral",
  "name_of_next_of_kin": "Damilola",
  "contact_of_next_of_kin": 09012345678,
  "address_of_next_of_kin": "No6 gra mobil ibadan",
  "role": "worker",
  "image":  "https://i.ibb.co/4pDNDk1/avatar.png"
} 
"email": "demilade123@gmail.com",
  "password": "Demilade1234"
{
 "name": "Demilade123",
  "email": "demilade123@gmail.com",
  "password": "Demilade1234",
  "phone": "08155966106",
  "address": "Demilade",
  "designation": "HOD",
  "team": "Pastoral",
  "department": "Pastoral",
  "name_of_next_of_kin": "Damilola",
  "contact_of_next_of_kin": "09012345678",
  "address_of_next_of_kin": "No6 gra mobil ibadan",
  "role": "worker",
  "image":  "https://i.ibb.co/4pDNDk1/avatar.png"
}

*/

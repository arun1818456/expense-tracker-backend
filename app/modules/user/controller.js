import User from "./model.js";
import bcrypt from "bcryptjs";
import {getUniqueName} from "../../utils/getUniqueUserName.js";
import { jwtTokenGenerator } from "../../utils/generateJWTtoken.js";

// Helper for consistent response format
const sendResponse = (res, status, success, message, data = null, error = null) => {
  return res.status(status).json({ success, message, data, error });
};

// ✅ REGISTER USER
export const RegisterUser = async (req, res) => {
  try {
    console.log("📥 Register user request received:", req.body||{});
    let { name, email, password, profileUrl } = req.body;

    // sanitize
    email = email?.trim()?.toLowerCase();

    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "All fields are required");
    }

    // check existing user
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return sendResponse(res, 400, false, `Email already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseUserName = await getUniqueName(name);
    const newUser = await User.create({
      name,
      userName: baseUserName,
      email,
      password: hashedPassword,
      profileUrl: profileUrl || null,
      updatedAt: Date.now(),
    });

    const token = jwtTokenGenerator(newUser._id);
    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      userName: newUser.userName,
      token,
      profileUrl: newUser.profileUrl,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return sendResponse(res, 200, true, "User registered successfully", userData);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error registering user", null, error.message);
  }
};

// ✅ LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password, deviceToken } = req.body || {};

    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return sendResponse(res, 400, false, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, 400, false, "Invalid email or password");

    user.deviceToken = deviceToken || user.deviceToken;
    await user.save();

    const token = jwtTokenGenerator(user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      token,
      profileUrl: user.profileUrl,
      deviceToken: user.deviceToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return sendResponse(res, 200, true, "Login successful", userData);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error logging in user", null, error.message);
  }
};

// ✅ LOGOUT USER
export const logoutUser = async (req, res) => {
  console.log("📥 Logout request received");
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { deviceToken: null });
    return sendResponse(res, 200, true, "Logout successful");
  } catch (error) {
    return sendResponse(res, 500, false, "Error logging out", null, error.message);
  }
};


// ✅ UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📥 Update user request received:", req.body||{});
    const { name, profileUrl } = req.body || {};

    if (!name) {
      return sendResponse(res, 400, false, "At least one field is required to update");
    }


    const updateData = {
      ...(name && { name }),
      ...(profileUrl && { profileUrl }),
      updatedAt: Date.now(),
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");


    const userData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileUrl: updatedUser.profileUrl,
      deviceToken: updatedUser.deviceToken,
      createdAt: updatedUser.createdAt,
    };

    return sendResponse(res, 200, true, "User updated successfully", userData);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error updating user", null, error.message);
  }
};
// ✅ GOOGLE LOGIN USER
export const googleLoginUser = async (req, res) => {
  console.log("📥 Google login request received:", req.body);

  try {
    let { email, name, profileUrl } = req.body || {};

    if (!email || !name) {
      return sendResponse(res, 400, false, "Email and name are required");
    }

    email = email.trim().toLowerCase();

    // 🔎 Check user exists
    let user = await User.findOne({ email });

    // 🔥 If NEW Google user → create new account
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google_oauth_dummy_passwordW$^%&R^&Y*U(", // dummy password
        profileUrl: profileUrl || null,
      });
    }

    // 🔥 Generate JWT Token
    const token = jwtTokenGenerator(user._id);



    return sendResponse(res, 200, true, "Google login successful", { token, ...user.toObject() });

  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error in Google login", null, error.message);
  }
};
// ✅ GET USER DETAILS
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }
    return sendResponse(res, 200, true, "User details fetched successfully", user.toObject());
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error fetching user details", null, error.message);
  }
};
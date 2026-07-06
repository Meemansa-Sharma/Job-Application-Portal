import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phone, password, role, company } = req.body;

    if (!firstname || !lastname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // role is restricted here on purpose - admin accounts are never
    // created through the public register endpoint (see seed/createAdmin.js)
    const safeRole = role === "employer" ? "employer" : "seeker";

    await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: safeRole,
      company: safeRole === "employer" ? company || "" : "",
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // deliberately identical message whether the email doesn't exist
    // or the password is wrong, so attackers can't tell which is the case
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not registered as ${role}` });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        company: user.company || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (protected - used to re-hydrate user info on page refresh)
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      user: req.user,
      profileCompletion: req.user.getProfileCompletion(),
    });
  } catch (error) {
    next(error);
  }
};

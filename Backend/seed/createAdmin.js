// One-off script to create the first (and any future) admin account.
// Admins are never created through the public /api/auth/register endpoint
// on purpose - this keeps that role out of reach of anyone just using the site.
//
// Usage:
//   node seed/createAdmin.js
//
// Edit the values below (or set them as env vars) before running, then
// delete/rotate the password afterwards if you hardcoded it here.

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

dotenv.config();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@hireconnect.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
const ADMIN_FIRSTNAME = process.env.SEED_ADMIN_FIRSTNAME || "Admin";
const ADMIN_LASTNAME = process.env.SEED_ADMIN_LASTNAME || "User";
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || "9999999999";

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`An account with ${ADMIN_EMAIL} already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    firstname: ADMIN_FIRSTNAME,
    lastname: ADMIN_LASTNAME,
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account created:");
  console.log(`  email: ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log("Log in and change this password path is not built yet - for now, just don't reuse this password elsewhere.");

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// protect: runs before any route that requires a logged-in user.
// It reads the JWT from the Authorization header, verifies it was
// signed by us (not forged), and attaches the real user to req.user
// so later code can trust req.user._id / req.user.role.
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// optionalAuth: for public routes that want to know WHO is asking, without
// requiring it. e.g. GET /api/jobs/:id is public, but if a logged-in seeker
// hits it, we can attach a skill-match score to the response.
// Never rejects the request - just attaches req.user if a valid token is present.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch (error) {
    // invalid/expired token on an optional route -> just proceed as a guest
    next();
  }
};

// authorize: a second gate AFTER protect, that checks the user's role.
// Usage: authorize("employer", "admin") -> only employers and admins pass.
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this" });
    }
    next();
  };
};

// Runs when no route matches the request at all
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Catches any error passed to next(error), or thrown in an async route
// in Express 5 (which auto-forwards async errors here).
// Centralizing this means controllers don't need try/catch boilerplate
// scattered everywhere with inconsistent error responses.
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose bad ObjectId (e.g. /api/jobs/123 where 123 isn't a valid id)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate value, this entry already exists" });
  }

  // Mongoose validation errors (required field missing, enum mismatch, etc.)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Multer file-size / file-type errors
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};

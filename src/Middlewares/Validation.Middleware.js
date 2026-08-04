import { ApiError } from "../Utils/ApiError.js";

// Validates user registration input
export const validateRegisterInput = (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    throw new ApiError(400, "Full Name is required");
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  next();
};

// Validates user login input
export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    throw new ApiError(400, "Password is required");
  }

  next();
};

import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/env.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization token missing.");
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const student = await Student.findById(decoded.sub).select("-password");

    if (!student) {
      throw new HttpError(401, "Authenticated user no longer exists.");
    }

    req.student = student;
    next();
  } catch (error) {
    throw new HttpError(401, "Invalid or expired token.");
  }
});
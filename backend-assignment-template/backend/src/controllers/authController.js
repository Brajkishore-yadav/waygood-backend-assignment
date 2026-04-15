import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";
import Student from "../models/Student.js";
import { jwtSecret, jwtExpiresIn } from "../config/env.js";
import jwt from "jsonwebtoken";

export const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    targetCountries = [],
    interestedFields = [],
    preferredIntake,
    maxBudgetUsd,
    englishTest,
  } = req.body;

  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    throw new HttpError(409, "Student with this email already exists.");
  }

  const student = await Student.create({
    fullName,
    email,
    password,
    targetCountries,
    interestedFields,
    preferredIntake,
    maxBudgetUsd,
    englishTest,
  });

  const token = jwt.sign(
    { sub: student._id },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  res.status(201).json({
    success: true,
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        profileComplete: student.profileComplete,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email }).select("+password");

  if (!student || !(await student.comparePassword(password))) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const token = jwt.sign(
    { sub: student._id },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  res.json({
    success: true,
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        profileComplete: student.profileComplete,
      },
      token,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      student: req.student,
    },
  });
});
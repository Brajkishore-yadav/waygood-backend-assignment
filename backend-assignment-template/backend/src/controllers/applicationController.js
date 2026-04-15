const Application = require("../models/Application");
const { validStatusTransitions, applicationStatuses } = require("../config/constants");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const listApplications = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const filters = {};

  if (studentId) {
    filters.student = studentId;
  }

  if (status) {
    filters.status = status;
  }

  const applications = await Application.find(filters)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: applications,
  });
});

const createApplication = asyncHandler(async (req, res) => {
  const studentId = req.student._id;
  const { program, intake } = req.body;

  // Check for duplicate application
  const existingApplication = await Application.findOne({
    student: studentId,
    program,
    intake,
  });

  if (existingApplication) {
    throw new HttpError(409, "Application for this program and intake already exists.");
  }

  const application = await Application.create({
    student: studentId,
    program,
    intake,
    status: "draft",
  });

  const populatedApplication = await Application.findById(application._id)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .lean();

  res.status(201).json({
    success: true,
    data: populatedApplication,
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!applicationStatuses.includes(status)) {
    throw new HttpError(400, `Invalid status: ${status}`);
  }

  const application = await Application.findById(id);
  if (!application) {
    throw new HttpError(404, "Application not found.");
  }

  if (application.student.toString() !== req.student._id.toString()) {
    throw new HttpError(403, "Not authorized to update this application.");
  }

  const currentStatus = application.status;
  if (!validStatusTransitions[currentStatus]?.includes(status)) {
    throw new HttpError(400, `Invalid status transition from ${currentStatus} to ${status}`);
  }

  // Append to timeline
  application.timeline.push({
    status,
    timestamp: new Date(),
    note: `Status updated to ${status}`,
  });

  application.status = status;
  await application.save();

  const populatedApplication = await Application.findById(id)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .lean();

  res.json({
    success: true,
    data: populatedApplication,
  });
});

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};

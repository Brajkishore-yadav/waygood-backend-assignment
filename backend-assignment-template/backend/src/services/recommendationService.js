const Program = require("../models/Program");
const Student = require("../models/Student");
const HttpError = require("../utils/httpError");

async function buildProgramRecommendations(studentId) {
  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const targetCountries = student.targetCountries || [];
  const interestedFields = student.interestedFields || [];
  const maxBudgetUsd = student.maxBudgetUsd || Infinity;
  const preferredIntake = student.preferredIntake;
  const englishScore = student.englishTest ? student.englishTest.score : 0;

  const pipeline = [
    {
      $match: {
        country: { $in: targetCountries },
      },
    },
    {
      $addFields: {
        countryScore: {
          $cond: {
            if: { $in: ["$country", targetCountries] },
            then: 35,
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        fieldScore: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $setIntersection: [["$field"], interestedFields],
                  },
                },
                0,
              ],
            },
            then: 30,
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        budgetScore: {
          $cond: {
            if: { $lte: ["$tuitionFeeUsd", maxBudgetUsd] },
            then: 20,
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        intakeScore: {
          $cond: {
            if: {
              $and: [
                { $ne: [preferredIntake, null] },
                { $in: [preferredIntake, "$intakes"] },
              ],
            },
            then: 10,
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        ieltsScore: {
          $cond: {
            if: { $gte: [englishScore, "$minimumIelts"] },
            then: 5,
            else: 0,
          },
        },
      },
    },
    {
      $addFields: {
        matchScore: {
          $sum: [
            "$countryScore",
            "$fieldScore",
            "$budgetScore",
            "$intakeScore",
            "$ieltsScore",
          ],
        },
      },
    },
    { 
      $sort: { matchScore: -1 } 
    },
    { 
      $limit: 5 
    },
    {
      $lookup: {
        from: "universities",
        localField: "university",
        foreignField: "_id",
        as: "university",
        pipeline: [{ $project: { name: 1, country: 1, city: 1 } }],
      },
    },
    {
      $addFields: {
        reasons: {
          $filter: {
            input: [
              { $cond: [{ $eq: ["$countryScore", 35] }, "Preferred country match", null] },
              { $cond: [{ $eq: ["$fieldScore", 30] }, "Field alignment", null] },
              { $cond: [{ $eq: ["$budgetScore", 20] }, "Within budget", null] },
              { $cond: [{ $eq: ["$intakeScore", 10] }, "Preferred intake available", null] },
              { $cond: [{ $eq: ["$ieltsScore", 5] }, "IELTS score meets requirement", null] },
            ],
            cond: { $ne: ["$$this", null] },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        degreeLevel: 1,
        field: 1,
        tuitionFeeUsd: 1,
        intakes: 1,
        minimumIelts: 1,
        country: 1,
        university: { $arrayElemAt: ["$university", 0] },
        matchScore: 1,
        reasons: 1,
      },
    },
  ];

  const recommendations = await Program.aggregate(pipeline);

  return {
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        targetCountries: student.targetCountries,
        interestedFields: student.interestedFields,
      },
      recommendations,
    },
    meta: {
      implementationStatus: "production-mongodb-aggregation-pipeline",
    },
  };
}

module.exports = {
  buildProgramRecommendations,
};

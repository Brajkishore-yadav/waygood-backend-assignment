const University = require("../models/University").default;
const Student = require("../models/Student");
const asyncHandler = require("../utils/asyncHandler");

const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.student;

  const recommendations = await University.aggregate([
    {
      $match: {
        country: { $in: user.targetCountries || [] }
      }
    },
    {
      $addFields: {
        score: {
          $add: [
            { $cond: [{ $gte: ["$popularScore", 80] }, 20, 0] },
            { $cond: ["$scholarshipAvailable", 10, 0] }
          ]
        }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json({
    success: true,
    data: recommendations
  });
});

module.exports = { getRecommendations };
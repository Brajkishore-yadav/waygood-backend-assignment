const express = require("express");
const router = express.Router();

const {
  listUniversities,
  listPopularUniversities,
} = require("../controllers/universityController");

// 🔥 routes
router.get("/", listUniversities);
router.get("/popular", listPopularUniversities);

module.exports = router;
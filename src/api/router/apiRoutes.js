const express = require("express");
const router = express.Router();

//schemaValidator
const validatorResponse = require("../../utility/joiValidator");

//controller
const {
  getStatesController,
  getCitiesByStateController,
  getJobTitleController,
  createCityController,
  updateCityController,
  deleteCityController,
} = require("../controllers/apiController");

// States
router.get("/states", getStatesController);

// Cities
router.get("/states/:stateId/cities", getCitiesByStateController);
router.post("/states/:stateId/cities", createCityController);
router.put("/cities/:cityId", updateCityController);
router.delete("/cities/:cityId", deleteCityController);

// Job title
router.get("/job-titles", getJobTitleController);

module.exports = router;

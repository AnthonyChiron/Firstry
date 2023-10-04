const express = require("express");
const router = express.Router();
const RidersController = require("../controllers/riders");

const riders = new RidersController();

// GET ALL RIDERS
router.get("/", riders.getAll);

// GET RIDER BY ID
router.get("/getById/:id", riders.getById);

// POST RIDER
router.post("/", riders.post);

// DELETE RIDER
router.delete("/:id", riders.deleteById);

// PUT RIDER
router.put("/:id", riders.update);

module.exports = router;

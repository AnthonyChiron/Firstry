const mongoose = require("mongoose");
const Joi = require("joi");

module.exports.Category = mongoose.model(
  "Category",
  mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: Date,
    sports: { type: Array, required: true },
    rules: { type: String, required: true },
    maxCompetitorCount: { type: Number, required: true },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
  })
);

module.exports.validate = function (category) {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().min(2).required(),
    startDate: Joi.date(),
    sports: Joi.array().items(Joi.string()).min(1).required(),
    rules: Joi.string().required(),
    maxCompetitorCount: Joi.number().required(),
    contest: Joi.objectId().required(),
  });

  return schema.validate(category);
};

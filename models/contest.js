const mongoose = require("mongoose");
const Joi = require("joi");

module.exports.Contest = mongoose.model(
  "Contest",
  mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: Date,
    endDate: Date,
    registrationEndDate: Date,
    sports: { type: Array },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    location: {
      country: { type: String },
      postalCode: { type: String },
      city: { type: String },
      address: { type: String },
    },
    branding: {
      logo: String,
      banner: String,
      trailer: String,
    },
    socials: {
      instagram: String,
      twitter: String,
      youtube: String,
      website: String,
    },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
  })
);

module.exports.validate = function (contest) {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().min(2),
    startDate: Joi.date(),
    endDate: Joi.date(),
    registrationEndDate: Joi.date(),
    location: {
      country: Joi.string().min(2),
      postalCode: Joi.string().allow(null, ""),
      city: Joi.string(),
      address: Joi.string(),
    },
    branding: {
      logo: Joi.string().uri().min(2),
      banner: Joi.string().uri().min(2),
      trailer: Joi.string().uri().min(2),
    },
    sports: Joi.array().items(Joi.string()).min(1),
    categories: Joi.array().items(Joi.objectId()).min(1),
    socials: Joi.object({
      instagram: Joi.string().min(3).pattern(new RegExp("^@")),
      twitter: Joi.string().min(3).pattern(new RegExp("^@")),
      youtube: Joi.string().min(3).pattern(new RegExp("^@")),
      website: Joi.string().uri(),
    }),
    organizerId: Joi.objectId(),
  });

  return schema.validate(contest);
};

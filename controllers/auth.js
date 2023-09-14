const jwt = require("jsonwebtoken");
const hash = require("../services/hash");
const crypto = require("crypto");
const { sendEmail } = require("../services/mail");
const { User, validateSignup, validateLogin } = require("../models/user");
const _ = require("lodash");
const rolesEnum = require("../constants/rolesEnum");
const {
  Organizer,
  validate: validateOrganizer,
} = require("../models/organizer");
const { Rider, validate: validateRider } = require("../models/rider");

module.exports = class AuthController {
  signup = async (req, res) => {
    console.log(req.body);
    const { error } = validateSignup(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("Email already exists");

    const verifyEmailToken = crypto.randomBytes(20).toString("hex");

    const user = new User({
      email: req.body.email,
      password: await hash.encrypt(req.body.password),
      isValid: false,
      verifyEmailToken: verifyEmailToken,
      role: req.body.role,
    });

    if (req.body.role == rolesEnum.CONTEST) {
      const reqOrganizer = req.body.organizer;
      console.log(reqOrganizer);
      const { error } = validateOrganizer(reqOrganizer);
      if (error) return res.status(400).send(error.details[0].message);

      const organizer = new Organizer(reqOrganizer);

      const savedOrganizer = await organizer.save();
      console.log(savedOrganizer);
      user.organizerId = savedOrganizer._id;
    }

    if (req.body.role == rolesEnum.RIDER) {
      const reqRider = req.body.rider;
      const { error } = validateRider(reqRider);
      if (error) return res.status(400).send(error.details[0].message);

      const rider = new Rider(reqRider);

      const savedRider = await rider.save();
      user.riderId = savedRider._id;
    }

    try {
      const savedUser = await user.save();

      sendEmail(
        savedUser.email,
        "Firstry - Validation de votre compte",
        "Veuillez cliquer sur ce lien pour vérifier votre compte: http://localhost:4200/verify/" +
          verifyEmailToken
      );

      res.send(
        JSON.stringify(
          _.pick(savedUser, [
            "_id",
            "email",
            "role",
            "isValid",
            "riderId",
            "organizerId",
          ])
        )
      );
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };

  login = async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email is not found");

    // Check if password is correct
    const validPass = await hash.isValid(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    // Create and assign a token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: user.email,
        isValid: user.isValid,
      },
      "SECRET_TOKEN"
    );
    res.send(JSON.stringify(token));
  };

  sendNewValidationEmail = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found");

    const verifyEmailToken = crypto.randomBytes(20).toString("hex");

    user.verifyEmailToken = verifyEmailToken;

    try {
      const savedUser = await user.save();

      sendEmail(
        savedUser.email,
        "Firstry - Validation de votre compte",
        "Veuillez cliquer sur ce lien pour vérifier votre compte: http://localhost:4200/account/validateEmail/" +
          verifyEmailToken
      );

      res.send(savedUser);
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  validateEmail = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("User not found");

    console.log(req.body.token);
    console.log(user.verifyEmailToken);
    if (user.verifyEmailToken !== req.body.token)
      return res.status(400).send("Invalid token");

    user.isValid = true;

    const savedUser = await user.save();
    res.send(savedUser);
  };
};

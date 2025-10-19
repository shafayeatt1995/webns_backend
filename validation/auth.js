const { check } = require("express-validator");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

const validate = {
  loginValidation: [
    check("email")
      .trim()
      .custom(async (value, { req }) => {
        try {
          const { id = null, password } = req.body;
          const user = await User.findOne({ email: value }).select(
            "+password +power +suspended +deleted"
          );
          if (user) {
            const pass = id ? id + process.env.SOCIAL_LOGIN_PASS : password;
            const check = await bcrypt.compare(pass, user.password);
            if (check) {
              if (user.suspended) {
                throw new Error(`Account suspended`);
              } else {
                if (user.deleted) {
                  throw new Error(`Account deleted`);
                } else {
                  req.user = user;
                }
              }
            } else {
              throw new Error(`Login failed. Invalid credentials.`);
            }
          } else {
            throw new Error(`Login failed. Invalid credentials.`);
          }
          return true;
        } catch (err) {
          throw new Error(err.message);
        }
      }),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  registerValidation: [
    check("name").trim().notEmpty().withMessage("Name is required"),
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already exists");
        }
        return true;
      }),
    check("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    check("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Confirm Password is required")
      .isLength({ min: 6 })
      .withMessage("Confirm Password must be at least 6 characters")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password does not match");
        }
        return true;
      }),
  ],
};

module.exports = validate;

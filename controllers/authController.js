import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    next("Provide Required Fields");
    return;
  }

  try {
    const UserExist = await Users.findOne({ email });
    if (UserExist) {
      next("Email Address Already Exists");
      return;
    }
    const hashedPassword = await hashString(password);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    sendVerificationEmail(user, res);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("please provide user credentials");
      return;
    }

    // find user by email
    const user = await Users.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    });

    if (!user) {
      next("Invalid email or password");
      return;
    }

    if (!user?.verified) {
      next(
        "user email is not verified.check your email account and verify your email"
      );
      return;
    }
    if (user.status === "blocked") {
      next("Your account is blocked. Please contact support for assistance.");
      return;
    }

    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      next("invalid email or password");
      return;
    }
    user.password = undefined;
    const token = createJWT(user?._id);
    console.log("my server side check",token)
    res.status(201).json({
      success: true,
      message: "Login Successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

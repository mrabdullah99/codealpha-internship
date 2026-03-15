import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ message: "User already exist" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid Credentials" });

  const token = generateToken(user._id);
  res.status(200).json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    redirectTo: user.role === "admin" ? "/admin/all-products" : "/",
  });
};

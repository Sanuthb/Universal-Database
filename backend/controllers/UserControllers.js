import User from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword, // ✅ FIXED
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ message: "User registered successfully", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }); // ✅ FIXED
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password); // ✅ FIXED
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const addConnection = async (req, res) => {
  try {
    const { name, type, url, dbName, serviceAccount } = req.body;

    // Validate
    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Connection name and type are required" });
    }

    const userId = req.user.id; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.connections.push({
      name,
      type,
      url,
      dbName,
      serviceAccount,
    });

    await user.save();

    res.status(201).json({
      message: "Connection added successfully",
      connections: user.connections,
    });
  } catch (err) {
    console.error("Add Connection Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getOrCreateApiKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let apiKey = user.apiKeys?.[0]?.key;
    if (!apiKey) {
      apiKey = crypto.randomBytes(24).toString("hex");
      user.apiKeys = [{ key: apiKey, label: "default" }];
      await user.save();
    }
    res.json({ success: true, apiKey });
  } catch (e) {
    console.error("API key error:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
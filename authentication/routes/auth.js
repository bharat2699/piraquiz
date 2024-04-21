import { Router } from "express";
import { model } from "mongoose";
import jwt from "jsonwebtoken";
import 'dotenv/config'

const { sign } = jwt;
const router = Router();
const User = model("User");

//signUp
router.post("/signup", async (req, res) => {
    const {
        email,
        password,
        fullName,
        username,
        dob,
        contact,
    } = req.body;
    try {
        if (!email || !password || !fullName) {
            return res.status(422).json({ error: "Email, password, and full name are required fields!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ error: "User already exists!" });
        }

        const user = new User({
            email,
            password,
            fullName,
            username,
            dob,
            contact,
        });

        const savedUser = await user.save();
        if (!savedUser) {
            return res.status(500).json({ error: "Failed to save user" });
        }

        const token = sign({ userId: savedUser._id }, process.env.JWT_KEY);

        res.json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

//signIn
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(422).json({ error: "You must provide your email and password!" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(422).json({ error: "Invalid password!" });
        }
        const token = sign({ userId: user._id }, process.env.JWT_KEY);
        res.json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

//Get user
router.get("/user", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: "Email is required!" });
    }
    try {
        const users = await User.find({ email: { $regex: email, $options: "i" } });
        if (!users) {
            return res.status(404).json({ error: "User Doesn't Exist!" });
        }
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

//exit and clear socket id
router.patch("/exit", async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ error: "Email is required!" });
        }
        const user = await User.findOneAndUpdate(
            { email: email },
            {
                socketid: "",
            }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "Socket id cleared!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;

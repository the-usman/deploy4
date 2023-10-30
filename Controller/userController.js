const asyncHandler = require('express-async-handler');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SecretKey = process.env.SECRET_KEY;

const SignUpUser = asyncHandler(async (req, res) => {
    try {
        const { name, password, email, pic } = req.body;

        if (!password || !name || !email) {
            return res.status(400).json({ success: false, error: "Invalid Request" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password.toString(), salt);

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists" });
        }

        const user = await User.create({
            email: email,
            name: name,
            password: secPass,
            pic: pic
        });

        if (user) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, SecretKey, {
                expiresIn: "30d"
            });

            return res.status(200).json({
                success: true,
                id: user._id,
                email: user.email,
                pic: user.pic,
                name: user.name,
                token
            });
        } else {
            return res.status(400).json({ success: false, error: "Failed to create user" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

const LoginUser = asyncHandler(async (req, res) => {
    try {
        const { password, email } = req.body;

        if (!password || !email) {
            return res.status(400).json({ success: false, error: "Invalid Request" });
        }

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const pass = await bcrypt.compare(password, existingUser.password);
        if (!pass) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const data = {
            user: {
                id: existingUser.id
            }
        };
        const token = jwt.sign(data, SecretKey, {
            expiresIn: "30d"
        });

        return res.status(200).json({
            success: true,
            id: existingUser._id,
            email: existingUser.email,
            pic: existingUser.pic,
            name: existingUser.name,
            token
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

const UpdatedUser = asyncHandler(async (req, res) => {
    // Logic for updating user data (if required)
    // Add necessary implementation or remove if not needed
});

const allUser = asyncHandler(async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ]
        } : {};
        const users = await User.find({
            ...keyword,
            _id: { $ne: req.user.id }
        });
        res.send(users);
    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = {
    SignUpUser,
    LoginUser,
    UpdatedUser,
    allUser
};


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../model/auth.schema');

// -------------------------- REGISTER ----------------------------------------------

const register = async (req, res) => {
    try {
        const { name , email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send('Name, email, and password are required!');
        }

        const emailExists = await auth.findOne({ email });

        if (emailExists) {
            return res.status(400).send('Email already exists!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await auth.create({
            name,
            email,
            password: hashedPassword
        });

        return res.status(201).send('User registered successfully!');

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
};


// -------------------------- LOGIN ----------------------------------------------

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Email and password are required!');
        }

        const user = await auth.findOne({ email });

        if (!user) {
            return res.status(400).send('User not found!');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid password!');
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).send('Login successful!');

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
};


// -------------------------- LOGOUT ----------------------------------------------

const logout = (req, res) => {
    // options must match the ones used when the cookie was set, or it won't clear
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    return res.status(200).send('Logged out!');
};


// -------------------------- ME ----------------------------------------------

const me = async (req, res) => {
    try {
        const user = await auth.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).send('User not found!');
        }

        return res.status(200).json(user);

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
};


module.exports = { register, login, logout, me };
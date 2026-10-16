const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (err) {
        // expired or tampered token
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };



const jwt = require('jsonwebtoken');
const keysecrect = "thisismysecrectcodehaveyouenjoy";

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token not provided' });
    }

    try {
        const decoded = jwt.verify(token, keysecrect);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = verifyToken;
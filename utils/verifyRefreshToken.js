
const jwt = require("jsonwebtoken");
const keysecrect = "thisismysecrectcodehaveyouenjoy";




const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken,keysecrect, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

module.exports = verifyRefreshToken;
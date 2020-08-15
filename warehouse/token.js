let jwt = require('jsonwebtoken');
const config = require('./config.js');

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'] || req.cookies['jwt']; // Express headers are auto converted to lowercase
    if (typeof (token) == "undefined") {
        return tokenNotFound(res);
    }

    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                // return res.sendStatus(401).json({ error: "No Profile Found" });
                return tokenNotFound(res);
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // return res.json({
        //     success: false,
        //     message: 'Auth token is not supplied'
        // });
        // res.send(401).json({
        //     success: false,
        //     message: 'Invalid Token or token not found: Authorization failed'
        // });
        // return;
        return tokenNotFound(res);
    }
};

function tokenNotFound(res) {
    res.status(401).send({
        success: false,
        message: 'Invalid Token or token not found: Authorization failed'
    });
}

module.exports = {
    checkToken: checkToken,
    tokenSerialize: tokenSerialize
}

function tokenSerialize(token) {
    if (typeof (token) != "undefined") {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        if (token) {
            return jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    // return res.sendStatus(401).json({ error: "No Profile Found" });
                    return null;
                } else {
                    return decoded;
                }
            });
        }
    }
    return null;
}
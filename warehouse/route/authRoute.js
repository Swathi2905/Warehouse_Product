const express = require("express");
const bodyParser = require("body-parser");
let jwt = require('jsonwebtoken');
let config = require('../config');
let tokenValidator = require('../token');
const knexConfig = require("../knexfile");
const knex = require('knex')(knexConfig);
const router = express.Router();
const Constants = require('./routeConstants');
const tableName = "users";

router.route("/").post(async (req, res, next) => {
    try {
        if (!req.body.loginId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'loginId field is mandatory' });
        else if (!req.body.password)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'password field is mandatory' });
        else {
            let login_id = req.body.loginId.toLowerCase();
            let password = req.body.password;

            await knex(tableName).where(
                {
                    login_id: login_id
                })
                .select('id')
                .then(async function (result) {
                    if (result.length == 0) {
                        res.status(Constants.StatusCodes.NoRecorFound).json({ status: false, message: 'UserId not found', data: null });
                    } else {
                        await knex(tableName).where(
                            {
                                login_id: login_id,
                                password: password
                            }).select('id')
                            .then(function (result) {
                                if (result.length == 0) {
                                    res.status(Constants.StatusCodes.Success).json({ status: false, message: 'Invalid credentials', data: null });
                                } else {
                                    let token = jwt.sign({
                                        loginId: result[0].id,
                                        app: 'test-app'
                                    },
                                        config.secret,
                                        {
                                            expiresIn: '24h' // expires in 24 hours
                                        }
                                    );
                                    // return the JWT token for the future API calls
                                    res.cookie('jwt', token); // add cookie here
                                    res.status(Constants.StatusCodes.Success).json({
                                        status: true,
                                        message: 'Authentication successful!',
                                        // token: token
                                    });
                                }
                            })
                            .catch(function (err) {
                                res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                            });
                    }
                }).catch(function (err) {
                    res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                })
        }

    }
    catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/logout").get(tokenValidator.checkToken, (req, res, next) => {
    try {
        res.cookie('jwt', ''); // add cookie here
        res.status(Constants.StatusCodes.Success).json({
            status: true,
            message: 'Logged Out!'
        });
    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/validateToken").get(tokenValidator.checkToken, (req, res, next) => {
    try {
        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'Valid token', data: null });
    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});


module.exports = router;

const express = require("express");
const bodyParser = require("body-parser");
const tokenValidator = require("../token");
const knexConfig = require("../knexfile");
const knex = require('knex')(knexConfig);
const router = express.Router();
const Constants = require('./routeConstants');
const tableName = "users";


router.route("/").get(tokenValidator.checkToken, async (req, res, next) => {
    var decryptToken = req.decoded;

    knex.select('id', 'f_name', 'l_name').from(tableName).whereNot({
        'id': decryptToken.loginId
    }).then((users) => {
        res.status(Constants.StatusCodes.Success).json({ success: true, message: '', data: users });
    })
});

router.route("/").post(async (req, res, next) => {
    try {
        if (!req.body.loginId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'loginId field is mandatory' });
        else if (!req.body.password)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'password field is mandatory' });
        else if (!req.body.firstName)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'First Name field is mandatory' });
        else if (!req.body.lastName)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Last Name field is mandatory' });
        else {
            let login_id = req.body.loginId;
            let password = req.body.password;

            await knex(tableName).where(
                {
                    login_id: login_id,
                }).select('*')
                .then(async function (result) {
                    if (result.length != 0) {
                        res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Login Id already exists', data: null });
                    } else {
                        await knex(tableName).insert(
                            {
                                login_id: login_id.toLowerCase(),
                                password: password,
                                f_name: camelCase(req.body.firstName),
                                l_name: camelCase(req.body.lastName),
                                created_on: new Date()
                            })
                            .then(function (result) {
                                res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok' });
                            })
                            .catch(function (err) {

                                res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                            });
                    }
                })
                .catch(function (err) {

                    res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                });
        }
    }
    catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});


module.exports = router;

function camelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
} 

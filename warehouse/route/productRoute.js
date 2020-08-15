
const express = require("express");
const bodyParser = require("body-parser");
const tokenValidator = require("../token");
let config = require('../config');
const knexConfig = require("../knexfile");
const knex = require('knex')(knexConfig);
const router = express.Router();
const Constants = require('./routeConstants');
const tableName = "products";

router.route("/").get(tokenValidator.checkToken, async (req, res, next) => {
    try {
        //  await knex.from(tableName).outerJoin('stocks', `${tableName}.id`, 'stocks.product_id')
        await knex.from(tableName)
            .join('stocks', function () {
                this
                    .on(`${tableName}.id`, 'stocks.product_id');
            }).select(`products.id`, 'products.name', 'products.description', 'stocks.quantity', 'stocks.price_per_unit')
            .then(function (result) {
                res.status(Constants.StatusCodes.Success).json({ status: true, message: '', data: [...result] });
            }).catch(function (err) {
                res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
            });

    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/:id").get(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.params.id)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product Id not found' });
        else {
            knex
                .from(tableName)
                .join('stocks', function () {
                    this
                        .on(`${tableName}.id`, 'stocks.product_id')
                        .on(`${tableName}.id`, '=', knex.raw('?', [req.params.id]))
                }).select(`products.id`, 'products.name', 'products.description', 'stocks.quantity', 'stocks.price_per_unit')
                .then(function (result) {
                    if (result.length == 0) {
                        res.status(Constants.StatusCodes.NoRecorFound).json({ status: false, message: 'No data found', data: null });
                    } else {
                        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok', data: result[0] });
                    }
                })
                .catch(function (err) {
                    res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                });;
        }

    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/").post(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.body.productName)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product name field is mandatory' });
        else if (!req.body.productDesc)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product desc field is mandatory' });
        else {
            const productname = titleCase(req.body.productName);
            await knex(tableName).where(
                {
                    name: productname,
                }).select('*')
                .then(async function (result) {
                    if (result.length != 0) {
                        res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product name already exists', data: null });
                    } else {
                        await knex(tableName).insert(
                            {
                                name: productname,
                                description: req.body.productDesc
                            })
                            .then(function (id) {
                                res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok', data: id });
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

router.route("/:id").delete(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.params.id)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product id is mandatory' });
        else
            await knex(tableName)
                .where('id', req.params.id)
                .del()
                .then(function (result) {
                    res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok' });
                })
                .catch(function (err) {
                    res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                });
    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});


module.exports = router;

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}
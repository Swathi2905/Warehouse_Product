
const express = require("express");
const bodyParser = require("body-parser");
const tokenValidator = require("../token");
let config = require('../config');
const knexConfig = require("../knexfile");
const knex = require('knex')(knexConfig);
const router = express.Router();
const Constants = require('./routeConstants');
const tableName = "warehouses";

router.route("/").get(tokenValidator.checkToken, async (req, res, next) => {
    try {
        await knex.from(tableName)
            .select('*')
            .then(function (result) {
                res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok', data: [...result] });
            })
            .catch(function (err) {
                res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
            });
    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/:Id").get(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.params.Id)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Warehouse Id not found' });
        else {
            await knex(tableName).where(
                {
                    id: req.params.Id
                }).select('*')
                .then(function (result) {
                    if (result.length == 0) {
                        res.status(Constants.StatusCodes.NoRecorFound).json({ status: false, message: 'No data found', data: null });
                    } else {
                        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok', data: result[0] });
                    }
                })
                .catch(function (err) {

                    res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
                });
        }


    } catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/").post(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.body.warehouseName)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'warehouse name field is mandatory' });

        var warehouse = titleCase(req.body.warehouseName);
        var decryptToken = req.decoded;
        await knex(tableName).where(
            {
                name: warehouse,
            }).select('*')
            .then(async function (result) {
                if (result.length != 0) {
                    res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Warehouse name already exists', data: null });
                } else {
                    await knex(tableName).insert(
                        {
                            name: warehouse
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
    catch (err) {
        res.status(Constants.StatusCodes.InternalServerError).json({ status: false, message: '', data: err });
    }
});

router.route("/:id").delete(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.params.id)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Warehouse id is mandatory' });
        else {
            await knex(tableName)
                .where('id', req.params.id)
                .then(async function (result) {
                    if (result.length != 0) {
                        var row = result[0];

                        const productIdsResult = await knex('stocks').where('warehouse_id', row.id).select('product_id');
                        const productIds = productIdsResult.map(a => a.product_id);

                        await knex('products')
                            .whereIn('id', productIds)
                            .del();

                        await knex('stocks')
                            .where('warehouse_id', row.id)
                            .del();

                        await knex(tableName)
                            .where('id', row.id)
                            .del();

                        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok' });
                    } else {
                        res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: `Warehouse id doesn't exits` });
                    }
                })
        }
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
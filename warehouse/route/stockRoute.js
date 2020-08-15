
const express = require("express");
const bodyParser = require("body-parser");
const tokenValidator = require("../token");
let config = require('../config');
const knexConfig = require("../knexfile");
const knex = require('knex')(knexConfig);
const router = express.Router();
const Constants = require('./routeConstants');
const tableName = "stocks";

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
            res.json({ status: false, message: 'Stock Id not found' });
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
        if (!req.body.productId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product id field is mandatory' });
        else if (!req.body.warehouseId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Warehouse id field is mandatory' });
        else if (!req.body.quantity)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Quantity  field is mandatory' });
        else if (!req.body.pricePerUnit)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Price field is mandatory' });

        else {
            const isWarehouseValid = await validateWarehouse(req.body.warehouseId);
            const isProductValid = await validateProduct(req.body.productId);
            if (!isWarehouseValid)
                return res.status(Constants.StatusCodes.NoRecorFound).json({ status: false, message: 'Invalid warehouse id' });
            else if (!isProductValid)
                return res.status(Constants.StatusCodes.NoRecorFound).json({ status: false, message: 'Invalid product id' });
            else
                await knex(tableName).where({
                    warehouse_id: req.body.warehouseId,
                    product_id: req.body.productId,
                }).select('*')
                    .then(async function (result) {
                        if (result.length != 0) {
                            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Stock already exists', data: null });
                        } else {
                            await knex(tableName).insert(
                                {
                                    warehouse_id: req.body.warehouseId,
                                    product_id: req.body.productId,
                                    quantity: req.body.quantity,
                                    price_per_unit: req.body.pricePerUnit
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
        res.json({ status: false, message: '', data: err });
    }
});

router.route("/").put(tokenValidator.checkToken, async (req, res, next) => {
    try {
        if (!req.body.stockId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Stock id field is mandatory' });
        else if (!req.body.productId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Product id field is mandatory' });
        else if (!req.body.warehouseId)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Warehouse id field is mandatory' });
        else if (!req.body.quantity)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Quantity  field is mandatory' });
        else if (!req.body.pricePerUnit)
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Price field is mandatory' });

        else {
            const isStockValid = await validateStock(req.body.stockId);
            const isProductValid = await validateProduct(req.body.productId);
            if (!isStockValid)
                return res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Invalid warehouse id' });

            else
                await knex(tableName)
                    .where({ id: req.body.stockId })
                    .update(
                        {
                            warehouse_id: req.body.warehouseId,
                            product_id: req.body.productId,
                            quantity: req.body.quantity,
                            price_per_unit: req.body.pricePerUnit
                        })
                    .then(function (result) {
                        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok' });
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
            res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: 'Stock id is mandatory' });
        else {
            await knex(tableName)
                .where('id', req.params.id)
                .then(async function (result) {
                    if (result.length != 0) {
                        var row = result[0];
                        await knex(tableName)
                            .where('id', row.id)
                            .del();

                        await knex('products')
                            .where('id', row.product_id)
                            .del();

                        res.status(Constants.StatusCodes.Success).json({ status: true, message: 'ok' });
                    } else {
                        res.status(Constants.StatusCodes.BadRequest).json({ status: false, message: `Stock id doesn't exits` });
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

function validateStock(stockId) {
    return knex('stocks').where({
        id: stockId
    }).select('*')
        .then(function (result) {
            if (result.length != 0) {
                return true;
            } else {
                return false;
            }
        })
        .catch(function (err) {
            return false;
        });
}

function validateWarehouse(warehouseId) {
    return knex('warehouses').where({
        id: warehouseId
    }).select('*')
        .then(function (result) {
            if (result.length != 0) {
                return true;
            } else {
                return false;
            }
        })
        .catch(function (err) {
            return false;
        });
}


function validateProduct(productId) {
    return knex('products').where({
        id: productId
    }).select('*')
        .then(function (result) {
            if (result.length != 0) {
                return true;
            } else {
                return false;
            }
        })
        .catch(function (err) {
            return false;
        });
}
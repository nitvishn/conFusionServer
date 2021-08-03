const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');
const favoritesRouter = express.Router();
const cors = require('./cors');

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.find({})
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ author: req.user._id })
            .then((favorite) => {
                if (favorite == null) {
                    Favorites.create({ author: req.user._id, dishes: req.body })
                        .then((favorite) => {
                            console.log("Entry created: ", favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    var dishes = favorite.dishes;
                    favorite.dishes.push(req.body.filter(x => !dishes.includes(x._id)).map(x => x._id));
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.deleteOne({ author: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

// favoritesRouter.route('/:dishId')
//     .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//     .get(cors.cors, (req, res, next) => {
//         Favorites.findOne({author: req.user._id})
//             .then((favorites) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorites);
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     })
//     .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//         res.statusCode = 403;
//         res.end('POST operation not supported on /favorites/' + req.params.dishId);
//     })
//     .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//         Favorites.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
//             .then((favorite) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(favorite);
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     })
//     .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//         favorites.findByIdAndRemove(req.params.dishId)
//             .then((resp) => {
//                 resp.statusCode = 200;
//                 resp.setHeader('Content-Type', 'application/json');
//                 resp.json(favorites);
//             }, (err) => next(err))
//             .catch((err) => next(err));
//     });

module.exports = favoritesRouter;

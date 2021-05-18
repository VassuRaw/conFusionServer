const express = require("express");
const bodyParser = require("body-parser");

const cors = require("./cors");
const authenticate = require("../authenticate");
const Favourites = require("../models/favorites");
const Dishes = require("../models/dishes");

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .populate("user")
      //   .populate("dishes")
      .then(
        (favs) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favs);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then(
        (fav) => {
          if (fav) {
            for (let i of req.body) {
              if (fav.dishes.indexOf(i._id) < 0) {
                fav.dishes.push(i._id);
              }
            }
            fav.save().then((fav) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(fav);
            });
          } else {
            Favourites.create({ user: req.user._id }).then((fav) => {
              for (let i of req.body) {
                if (fav.dishes.indexOf(i._id) < 0) {
                  fav.dishes.push(i._id);
                }
              }
              fav.save().then((fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              });
            });
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /favourites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.deleteMany({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favouriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findOne({ _id: req.params.dishId })
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then(
        (fav) => {
          if (fav) {
            if (fav.dishes.indexOf(req.params.dishId) < 0) {
              fav.dishes.push(req.params.dishId);
              fav.save().then((fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              });
            } else {
              err = new Error(
                `${req.params.dishId} is already in your favourite list!`
              );
              err.status = 405;
              return next(err);
            }
          } else {
            Favourites.create({ user: req.user._id }).then((fav) => {
              fav.dishes.push(req.params.dishId);
              fav.save().then((fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              });
            });
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation is not supported on /favourites/${req.params.dishId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then(
        (fav) => {
          if (fav) {
            if (fav.dishes.indexOf(req.params.dishId) < 0) {
              err = new Error(
                `${req.params.dishId} is not in your favourites list. Can't Delete!!!`
              );
              err.status = 405;
              return next(err);
            } else {
              let i = fav.dishes.indexOf(req.params.dishId);
              fav.dishes.splice(i, 1);
              fav.save().then((fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              });
            }
          } else {
            err = new Error("No favourites found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favouriteRouter;

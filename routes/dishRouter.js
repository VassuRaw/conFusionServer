const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  // .all((request, response, next) => {
  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "text/plain");
  //   next();
  // })
  .get((request, response, next) => {
    Dishes.find()
      .then(
        (dishes) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((request, response, next) => {
    Dishes.create(request.body)
      .then(
        (dish) => {
          console.log("Dish created ", dish);
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((request, response, next) => {
    response.statusCode = 403;
    response.end("PUT operation is not supported on /dishes");
  })
  .delete((request, response, next) => {
    Dishes.deleteMany()
      .then(
        (result) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(result);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId")
  .get((request, response, next) => {
    Dishes.findById(request.params.dishId)
      .then(
        (dish) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((request, response, next) => {
    response.statusCode = 403;
    response.end(
      `POST operation not supported on /dishes/${request.params.dishId}`
    );
  })
  .put((request, response, next) => {
    Dishes.findByIdAndUpdate(
      request.params.dishId,
      { $set: request.body },
      { new: true }
    )
      .then(
        (dish) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((request, response, next) => {
    Dishes.findByIdAndRemove(request.params.dishId)
      .then(
        (result) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(result);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const Promotions = require("../models/promotions");
const cors = require("./cors");

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route("/")
  // .all((request, response, next) => {
  //   response.statusCode = 200;
  //   response.setHeader("Content-Type", "text/plain");
  //   next();
  // })
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (request, response, next) => {
    Promotions.find()
      .then(
        (promos) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(promos);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Promotions.create(request.body)
        .then(
          (promo) => {
            console.log("Promotion inserted ", promo);
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(promo);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end("PUT operation is not supported on /promotions");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Promotions.deleteMany()
        .then(
          (result) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(result);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

promoRouter
  .route("/:promoId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (request, response, next) => {
    Promotions.findById(request.params.promoId)
      .then(
        (promo) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.json(promo);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end(
        `POST operation not supported on /promotions/${request.params.promoId}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Promotions.findByIdAndUpdate(
        request.params.promoId,
        { $set: request.body },
        { new: true }
      )
        .then(
          (promo) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(promo);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Promotions.findByIdAndRemove(request.params.promoId)
        .then(
          (result) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(result);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = promoRouter;

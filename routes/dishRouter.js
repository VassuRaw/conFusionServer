const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authenticate = require("../authenticate");
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
      .populate("comments.author")
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
  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
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
    }
  )
  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end("PUT operation is not supported on /dishes");
    }
  )
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
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
    }
  );

dishRouter
  .route("/:dishId")
  .get((request, response, next) => {
    Dishes.findById(request.params.dishId)
      .populate("comments.author")
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
  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      response.statusCode = 403;
      response.end(
        `POST operation not supported on /dishes/${request.params.dishId}`
      );
    }
  )
  .put(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
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
    }
  )
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
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
    }
  );

dishRouter
  .route("/:dishId/comments")
  .get((request, response, next) => {
    Dishes.findById(request.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (dish != null) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.json(dish.comments);
          } else {
            err = new Error(`Dish ${request.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (request, response, next) => {
    Dishes.findById(request.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            request.body.author = request.user._id;
            dish.comments.push(request.body);
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "application/json");
                    response.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(`Dish ${request.params.dishId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (request, response, next) => {
    response.statusCode = 403;
    response.end(
      `PUT operations not supported on /dishes/${request.params.dishId}/comments`
    );
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (request, response, next) => {
      Dishes.findById(request.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              for (var i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
              }
              dish.save().then(
                (dish) => {
                  response.statusCode = 200;
                  response.setHeader("Content-Type", "application/json");
                  response.json(dish);
                },
                (err) => next(err)
              );
            } else {
              err = new Error(`Dish ${request.params.dishId} not found`);
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((request, response, next) => {
    Dishes.findById(request.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (
            dish != null &&
            dish.comments.id(request.params.commentId) != null
          ) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "applications/json");
            response.json(dish.comments.id(request.params.commentId));
          } else if (dish == null) {
            err = new Error(`Dish ${request.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${request.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (request, response, next) => {
    response.statusCode = 403;
    response.end(
      `POST operation not supported on /dishes/${request.params.dishId}/comments/${request.params.commentId}`
    );
  })
  .put(authenticate.verifyUser, (request, response, next) => {
    Dishes.findById(request.params.dishId)
      .then(
        (dish) => {
          console.log(dish);
          if (
            dish != null &&
            dish.comments.id(request.params.commentId) != null
          ) {
            if (
              !request.user._id.equals(
                dish.comments.id(request.params.commentId).author
              )
            ) {
              err = new Error("You are not authorized to edit this comment");
              err.status = 403;
              return next(err);
            }
            if (request.body.rating) {
              dish.comments.id(request.params.commentId).rating =
                request.body.rating;
            }
            if (request.body.comment) {
              dish.comments.id(request.params.commentId).comment =
                request.body.comment;
            }
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "application/json");
                    response.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error(`Dish ${request.params.dishId} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${request.params.commentId} not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (request, response, next) => {
    Dishes.findById(request.params.dishId)
      .then(
        (dish) => {
          if (
            dish != null &&
            dish.comments.id(request.params.commentId) != null
          ) {
            if (
              !request.user._id.equals(
                dish.comments.id(request.params.commentId).author
              )
            ) {
              err = new Error("You are not authorized to delete this comment");
              err.status = 403;
              return next(err);
            }
            dish.comments.id(request.params.commentId).remove();
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader("Content-Type", "application/json");
                    response.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            err = new Error("Dish " + request.params.dishId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error(
              "Comment " + request.params.commentId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;

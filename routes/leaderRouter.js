const express = require("express");
const bodyParser = require("body-parser");

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter
  .route("/")
  .all((request, response, next) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((request, response, next) => {
    response.end("Will send all the leaders to you!");
  })
  .post((request, response, next) => {
    response.end(
      `Will add the leader: ${request.body.name}  with details ${request.body.description}`
    );
  })
  .put((request, response, next) => {
    response.statusCode = 403;
    response.end("PUT operation is not supported on /leaders");
  })
  .delete((request, response, next) => {
    response.end("Deleting all the leaders");
  });

leaderRouter
  .route("/:leaderId")
  .get((request, response, next) => {
    response.end(
      `Will send details of the leader: ${request.params.leaderId} to you!`
    );
  })
  .post((request, response, next) => {
    response.statusCode = 403;
    response.end(
      `POST operation not supported on /leaders/${request.params.leaderId}`
    );
  })
  .put((request, response, next) => {
    response.write(`Updating the leader: ${request.params.leaderId}\n`);
    response.end(
      `Will update the leader: ${request.body.name} with details: ${request.body.description}`
    );
  })
  .delete((request, response, next) => {
    response.end(`Deleting leader: ${request.params.leaderId}`);
  });

module.exports = leaderRouter;

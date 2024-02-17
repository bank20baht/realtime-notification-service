import "reflect-metadata";
import express from "express";
import Container, { Token } from "typedi";
import {
  RabbitMQConnector,
  RabbitMQConnectorIdentifier,
} from "./utils/connections/RabbitMQConnector";
import cors from "cors";
import serverSentEvent from "./modules/server-sent-event/ServerSentEventRoutes";

async function initRabbitMQ() {
  const rabbitMQConnector = new RabbitMQConnector({
    hostname: process.env.RABBITMQ__HOST as string,
    port: Number.parseInt(process.env.RABBITMQ__PORT || "5672"),
    username: process.env.RABBITMQ__USER as string,
    password: process.env.RABBITMQ__PASSWORD as string,
  });

  rabbitMQConnector.on("retryExceeded", () => {
    process.exit(-104);
  });
  await rabbitMQConnector.connect();

  await rabbitMQConnector.createChannel();
  console.log("RabbitMQ connected");

  Container.set(RabbitMQConnectorIdentifier, rabbitMQConnector);
}

async function initServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get("/check", (req, res) => {
    res.json({ message: "API working" });
  });

  app.use(serverSentEvent);

  app.listen(process.env.PORT, () => {
    console.log(
      `Producer service listening at http://localhost:${process.env.PORT}`
    );
  });
}

async function main() {
  await initRabbitMQ();
  await initServer();
}
main();

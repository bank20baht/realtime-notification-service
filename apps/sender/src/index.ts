import "reflect-metadata";
import express from "express";
import Container, { Token } from "typedi";
import {
  RabbitMQConnector,
  RabbitMQConnectorIdentifier,
} from "./utils/connections/RabbitMQConnector";
import cors from "cors";
import notificationRouter from "./routes/Notification";

async function initRabbitMQ() {
  const rabbitMQConnector = new RabbitMQConnector({
    hostname: "localhost",
    port: 5672,
    username: "admin",
    password: "admin",
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

  app.use(notificationRouter);

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Producer service listening at http://localhost:${PORT}`);
  });
}

async function main() {
  try {
    await initRabbitMQ();
    await initServer();
  } catch (error) {
    console.error("Error during initialization:", error);
    process.exit(1);
  }
}

main();

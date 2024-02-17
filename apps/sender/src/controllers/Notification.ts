import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { RabbitMQConnectorIdentifier } from "../utils/connections/RabbitMQConnector";

export const sentGroupNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const group = req.body.project_id;
  const message = req.body.description;
  const exchange = "topic_logs";

  const producer = Container.get(RabbitMQConnectorIdentifier);
  console.log(message);
  const routingKey = `*.${group}`;

  await producer.channel.assertExchange(exchange, "topic", {
    durable: false,
  }); // Assert topic exchange

  await producer.channel.publish(
    exchange,
    routingKey,
    Buffer.from(`group${group} : ${message}`) // Use user ID in the message
  );

  res.status(201).send({ message: "send Group notification successful" });

  setTimeout(async () => {
    await producer.disconnect();
  }, 500);
};

export const sentUserNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.body.user_id;
  const message = req.body.description;
  const exchange = "topic_logs";

  const producer = Container.get(RabbitMQConnectorIdentifier);
  console.log(message);
  const routingKey = `${userId}.*`;

  await producer.channel.assertExchange(exchange, "topic", {
    durable: false,
  });

  await producer.channel.publish(
    exchange,
    routingKey,
    Buffer.from(`user${userId} : ${message}`)
  );

  res.status(201).send({ message: "send User notification successful" });
};

export const sentAnnouncementNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = req.body.description;
  const exchange = "topic_logs";

  const producer = Container.get(RabbitMQConnectorIdentifier);
  console.log(message);
  const routingKey = `#`;

  await producer.channel.assertExchange(exchange, "topic", {
    durable: false,
  }); // Assert topic exchange

  await producer.channel.publish(
    exchange,
    routingKey,
    Buffer.from(`Announcement : ${message}`) // Use user ID in the message
  );

  res
    .status(201)
    .send({ message: "send Announcement notification successful" });
};

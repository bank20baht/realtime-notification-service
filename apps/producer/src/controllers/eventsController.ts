import { NextFunction, Request, Response } from "express";
import Container, { Token } from "typedi";
import {
  RabbitMQConnector,
  RabbitMQConnectorIdentifier,
} from "../utils/connections/RabbitMQConnector";

interface ProducerStream {
  subscribe: (subscriber: Response) => void;
  unsubscribe: (subscriber: Response) => void;
  close: () => void;
}

type ProducerStreamMap = Map<string, ProducerStream>;

const producerStreamMapToken = new Token<ProducerStreamMap>();

Container.set(producerStreamMapToken, new Map<string, ProducerStream>());

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const producerStreamMap = Container.get<ProducerStreamMap>(
    producerStreamMapToken
  );
  const userId = req.params.user_id;
  const groupId = req.params.group_id;
  const MutexKeyName = `${userId}.${groupId}`;

  const bindRoutingKey = [`${userId}.*`, `*.${groupId}`];

  let producerStream = producerStreamMap.get(MutexKeyName);
  if (!producerStream) {
    producerStream = await setupProducerStream(bindRoutingKey, MutexKeyName);
    producerStreamMap.set(MutexKeyName, producerStream);
  }

  // Set the Content-Type header to text/event-stream
  res.setHeader("Content-Type", "text/event-stream");

  // Set CORS headers if necessary
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  res.write(":ok\n\n");
  producerStream.subscribe(res);

  req.on("close", () => {
    producerStream.unsubscribe(res);
  });

  // Add an error event listener to handle errors
  req.on("error", (err) => {
    console.error("Request error:", err);
    producerStream.unsubscribe(res);
  });
};

async function setupProducerStream(
  bindRoutingKey: string[],
  sumRoutingKey: string
) {
  const exchange = "topic_logs";
  const queue = sumRoutingKey;
  const producerStreamMap = Container.get<ProducerStreamMap>(
    producerStreamMapToken
  );

  const consumer = Container.get<RabbitMQConnector>(
    RabbitMQConnectorIdentifier
  );

  if (!consumer.channel) {
    await consumer.createChannel();
  }

  await consumer.channel.assertExchange(exchange, "topic", { durable: false });
  const { queue: q } = await consumer.channel.assertQueue(queue, {
    exclusive: true,
  });

  for (const routingKey of bindRoutingKey) {
    await consumer.channel.bindQueue(q, exchange, routingKey);
  }

  console.log(
    `Waiting for messages with routing key: ${bindRoutingKey}. To exit press CTRL+C`
  );

  const subscribers: { [key: string]: Response[] } = {};
  subscribers[sumRoutingKey] = [];

  consumer.channel.consume(
    q,
    (msg) => {
      if (msg !== null) {
        console.log(`Received: ${msg.content.toString()}`);
        subscribers[sumRoutingKey].forEach((subscriber) => {
          sendEventsToAll(subscriber, msg.content.toString());
        });
      }
    },
    { noAck: true }
  );

  return {
    subscribe: (subscriber: Response) => {
      subscribers[sumRoutingKey].push(subscriber);
    },
    unsubscribe: (subscriber: Response) => {
      const index = subscribers[sumRoutingKey].indexOf(subscriber);
      if (index > -1) {
        subscribers[sumRoutingKey].splice(index, 1);
      }
      if (subscribers[sumRoutingKey].length === 0) {
        console.log(`Queue '${sumRoutingKey}' has been deleted.`);
        consumer.channel.deleteQueue(sumRoutingKey);
        producerStreamMap.delete(sumRoutingKey);
      }
    },
    close: () => {},
  };
}

function sendEventsToAll(res: Response, data: string) {
  // Send a comment line to keep the connection alive
  res.write(":keep-alive\n\n");

  // Send the actual data with the appropriate SSE headers
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

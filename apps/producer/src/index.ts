import express, { NextFunction, Request, Response } from "express";
import amqp from "amqplib";

const app = express();

const producerStreamMap = new Map();

app.get("/events", async (req: Request, res: Response, next: NextFunction) => {
  // Extract the user ID from the URL parameters
  const userId = req.query.user_id;
  const groupId = req.query.group_id;
  const MutexKeyName = `${userId}.${groupId}`;

  const bindRoutingKey = [`${userId}.*`, `*.${groupId}`];

  // Check if the producer stream has already been created for this user ID
  let producerStream = producerStreamMap.get(MutexKeyName);
  if (!producerStream) {
    // Create the producer stream and set up the AMQP connection
    producerStream = await setupProducerStream(bindRoutingKey, MutexKeyName);
    producerStreamMap.set(MutexKeyName, producerStream);
  }

  // Subscribe the consumer to the shared producer stream
  producerStream.subscribe(res);

  // Release the subscription when the request is closed
  req.on("close", () => {
    producerStream.unsubscribe(res);
  });
});

// Function to set up the producer stream and AMQP connection
async function setupProducerStream(
  bindRoutingKey: string[],
  sumRoutingKey: string
) {
  const exchange = "topic_logs"; // Changed to topic exchange name
  const queue = ""; // Empty queue name means the queue is exclusive to the connection
  // Use the user ID as the routing key with a wildcard

  const connection = await amqp.connect("amqp://admin:admin@localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "topic", { durable: false }); // Assert topic exchange
  const { queue: q } = await channel.assertQueue(queue, { exclusive: true });

  for (const routingKey of bindRoutingKey) {
    await channel.bindQueue(q, exchange, routingKey);
  }

  console.log(
    `Waiting for messages with routing key: ${bindRoutingKey}. To exit press CTRL+C`
  );

  // Initialize the list of subscribers for this user ID
  const subscribers: any = {};
  subscribers[sumRoutingKey] = [];

  // Consume messages from the queue and broadcast them to all subscribers
  channel.consume(
    q,
    (msg) => {
      if (msg !== null) {
        console.log(`Received: ${msg.content.toString()}`);
        // Broadcast the message to all subscribers for this user ID
        subscribers[sumRoutingKey].forEach((subscriber: any) => {
          sendEventsToAll(subscriber, msg.content.toString());
        });
      }
    },
    { noAck: true }
  );

  // Return an object with methods to manage the producer stream
  return {
    subscribe: (subscriber: any) => {
      subscribers[sumRoutingKey].push(subscriber);
    },
    unsubscribe: (subscriber: any) => {
      const index = subscribers[sumRoutingKey].indexOf(subscriber);
      if (index > -1) {
        subscribers[sumRoutingKey].splice(index, 1);
      }
      // If there are no more subscribers for this user ID, close the channel and connection
      if (subscribers[sumRoutingKey].length === 0) {
        channel.close();
        connection.close();
        // Remove the producer stream from the map
        producerStreamMap.delete(sumRoutingKey);
      }
    },
    close: () => {
      channel.close();
      connection.close();
    },
  };
}

function sendEventsToAll(res: Response, data: string) {
  // Change Request to Response
  console.log(`data: ${JSON.stringify(data)}`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Producer service listening at http://localhost:${PORT}`);
});

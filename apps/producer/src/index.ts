import express, { NextFunction, Request, Response } from "express";
import amqp from "amqplib";
import { Mutex } from "async-mutex";

const app = express();
// Global mutex to ensure only one producer stream per user ID
const globalUserIdMutexMap = new Map();
// Map to hold the producer streams for each user ID
const producerStreamMap = new Map();

app.get(
  "/events/:user_id",
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the user ID from the URL parameters
    const userId = req.params.user_id;

    // Acquire the global mutex for this user ID
    let globalMutex = globalUserIdMutexMap.get(userId);
    if (!globalMutex) {
      globalMutex = new Mutex();
      globalUserIdMutexMap.set(userId, globalMutex);
    }
    const releaseGlobalLock = await globalMutex.acquire();

    // Check if the producer stream has already been created for this user ID
    let producerStream = producerStreamMap.get(userId);
    if (!producerStream) {
      // Create the producer stream and set up the AMQP connection
      producerStream = await setupProducerStream(userId);
      producerStreamMap.set(userId, producerStream);
    }

    // Release the global lock after the producer stream is set up
    releaseGlobalLock();

    // Subscribe the consumer to the shared producer stream
    producerStream.subscribe(res);

    // Release the subscription when the request is closed
    req.on("close", () => {
      producerStream.unsubscribe(res);
    });
  }
);

// Function to set up the producer stream and AMQP connection
async function setupProducerStream(userId: string) {
  const exchange = "direct_logs";
  const queue = ""; // Empty queue name means the queue is exclusive to the connection
  const routingKey = userId; // Listen for messages with the routing key 'hello'

  const connection = await amqp.connect("amqp://admin:admin@localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "direct", { durable: false });
  const { queue: q } = await channel.assertQueue(queue, { exclusive: true });

  await channel.bindQueue(q, exchange, routingKey);

  console.log(
    `Waiting for messages with routing key: ${routingKey}. To exit press CTRL+C`
  );

  // Initialize the list of subscribers
  const subscribers: any = [];

  // Consume messages from the queue and broadcast them to all subscribers
  channel.consume(
    q,
    (msg) => {
      if (msg !== null) {
        console.log(`Received: ${msg.content.toString()}`);
        // Broadcast the message to all subscribers
        subscribers.forEach((subscriber: any) => {
          sendEventsToAll(subscriber, msg.content.toString());
        });
      }
    },
    { noAck: true }
  );

  // Return an object with methods to manage the producer stream
  return {
    subscribe: (subscriber: any) => {
      subscribers.push(subscriber);
    },
    unsubscribe: (subscriber: any) => {
      const index = subscribers.indexOf(subscriber);
      if (index > -1) {
        subscribers.splice(index, 1);
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

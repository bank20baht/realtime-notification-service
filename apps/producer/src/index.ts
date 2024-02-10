import express, { NextFunction, Request, Response } from "express";
import amqp from "amqplib";

const app = express();

app.get("/events", async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(":ok\n\n");

  const exchange = "direct_logs";
  const queue = ""; // Empty queue name means the queue is exclusive to the connection
  const routingKey = "hello"; // Listen for messages with the routing key 'hello'

  const connection = await amqp.connect("amqp://admin:admin@localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, "direct", { durable: false });
  const { queue: q } = await channel.assertQueue(queue, { exclusive: true });

  await channel.bindQueue(q, exchange, routingKey);

  console.log(
    `Waiting for messages with routing key: ${routingKey}. To exit press CTRL+C`
  );

  channel.consume(
    q,
    (msg) => {
      if (msg !== null) {
        console.log(`Received: ${msg.content.toString()}`);
        sendEventsToAll(res, msg.content.toString());
      }
    },
    { noAck: true }
  );

  req.on("close", () => {
    console.log("offline");
    channel.close();
    connection.close();
  });
});

function sendEventsToAll(res: Response, data: string) {
  // Change Request to Response
  console.log(`data: ${JSON.stringify(data)}`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Producer service listening at http://localhost:${PORT}`);
});

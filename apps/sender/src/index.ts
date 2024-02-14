import express, { NextFunction, Request, Response } from "express";
import amqp from "amqplib";

const app = express();

app.use(express.json());
app.post(
  "/notification",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.user_id;
    const group = req.body.group_id;
    const message = req.body.description;
    const exchange = "topic_logs"; // Changed to topic exchange name

    console.log(message);
    const routingKey = `${id}.${group}`; // Combined user ID and group ID as routing key

    try {
      const connection = await amqp.connect("amqp://admin:admin@localhost");
      const channel = await connection.createChannel();

      await channel.assertExchange(exchange, "topic", { durable: false }); // Assert topic exchange

      await channel.publish(
        exchange,
        routingKey,
        Buffer.from(`user${id} : ${message}`) // Use user ID in the message
      );

      res.status(201).send({ message: "send notification successful" });

      setTimeout(() => {
        channel.close();
        connection.close();
      }, 500);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Failed to send notification" });
    }
  }
);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Sender service listening at http://localhost:${PORT}`);
});

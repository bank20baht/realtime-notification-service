import express, { NextFunction, Request, Response } from "express";
import amqp from "amqplib";

const app = express();

app.use(express.json());
app.post(
  "/notification",
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.id;
    const message = req.body.description;
    const exchange = "direct_logs";

    console.log(message);
    const routingKey = `${id}`;

    try {
      const connection = await amqp.connect("amqp://admin:admin@localhost");
      const channel = await connection.createChannel();

      await channel.assertExchange(exchange, "direct", { durable: false });

      await channel.publish(
        exchange,
        routingKey,
        Buffer.from(`user1 : ${message}`)
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

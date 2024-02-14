const amqp = require("amqplib");

async function receiveMessages() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();
    const exchange = "topic_logs";
    const queue = "c3g2_queue";
    const bindingKey = "*.g2";

    await channel.assertExchange(exchange, "topic", { durable: false });
    const { queue: q } = await channel.assertQueue(queue, { exclusive: true });
    channel.bindQueue(q, exchange, bindingKey);

    console.log(
      `Waiting for messages with routing key pattern: ${bindingKey}. To exit press CTRL+C`
    );

    channel.consume(
      q,
      (msg) => {
        if (msg !== null) {
          console.log(`Received: ${msg.content.toString()}`);
        }
      },
      { noAck: true }
    );
  } catch (error) {
    console.error(error);
  }
}

receiveMessages();

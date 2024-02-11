// receiver.js
const amqp = require("amqplib");

async function receiveMessages() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();
    const exchange = "direct_logs";
    const queue = ""; // Empty queue name means the queue is exclusive to the connection
    const routingKey = "hello"; // Listen for messages with the routing key 'hello'

    // Assert the exchange exists or create it
    await channel.assertExchange(exchange, "direct", { durable: false });

    // Assert the queue exists or create it
    const { queue: q } = await channel.assertQueue(queue, { exclusive: true });

    // Bind the queue to the exchange with the specified routing key
    await channel.bindQueue(q, exchange, routingKey);

    console.log(
      `Waiting for messages with routing key: ${routingKey}. To exit press CTRL+C`
    );

    // Consume messages from the queue
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

// c2g1.js
const amqp = require("amqplib");

async function main() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();

    const exchangeName = "topic_logs";
    const queueName = "user2token";

    // Define the routing keys for user2 and group1
    const routingKeys = ["user2.*", "*.group1"]; // Matches strings starting with 'user2.' and ending with '.group1'

    await channel.assertExchange(exchangeName, "topic", { durable: false });
    const q = await channel.assertQueue(queueName, { exclusive: true });

    // Bind the queue to the exchange with each routing key
    for (const routingKey of routingKeys) {
      await channel.bindQueue(q.queue, exchangeName, routingKey);
    }

    console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();

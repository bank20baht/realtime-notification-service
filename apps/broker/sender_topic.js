// sender.js
const amqp = require("amqplib");

async function main() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();

    // Declare a topic exchange
    const exchangeName = "topic_logs";
    await channel.assertExchange(exchangeName, "topic", { durable: false });

    // Send a message to user2
    const routingKeyForUser2 = "user2.*"; // Routing key for user2
    const messageForUser2 = "Hello User2!";
    channel.publish(
      exchangeName,
      routingKeyForUser2,
      Buffer.from(messageForUser2)
    );
    console.log(`Sent message to ${routingKeyForUser2}: ${messageForUser2}`);

    // Send a message to group1
    const routingKeyForGroup1 = "*.group1"; // Routing key for group1
    const messageForGroup1 = "Hello Group1!";
    channel.publish(
      exchangeName,
      routingKeyForGroup1,
      Buffer.from(messageForGroup1)
    );
    console.log(`Sent message to ${routingKeyForGroup1}: ${messageForGroup1}`);

    // Send a message to user1
    const routingKeyForUser1 = "user1.*"; // Routing key for group1
    const messageForUser1 = "Hello User1!";
    channel.publish(
      exchangeName,
      routingKeyForUser1,
      Buffer.from(messageForUser1)
    );
    console.log(`Sent message to ${routingKeyForUser1}: ${messageForUser1}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();

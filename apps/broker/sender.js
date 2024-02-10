const amqp = require("amqplib");

async function sendMessage() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();
    const exchange = "direct_logs";
    const routingKey1 = "1"; // Updated routing key
    const routingKey2 = "2";
    // Assert the exchange exists or create it
    await channel.assertExchange(exchange, "direct", { durable: false });

    // Send a message every  5 seconds
    setInterval(() => {
      const message = new Date().toISOString(); // Current time as a string
      channel.publish(exchange, routingKey1, Buffer.from(`user1 : ${message}`)); // Publish to routing key 1
      channel.publish(exchange, routingKey2, Buffer.from(`user2 : ${message}`)); // Publish to routing key 2
      console.log(`Sent to ${routingKey1} and ${routingKey2}: ${message}`);
    }, 5000); //  5000 milliseconds =  5 seconds
  } catch (error) {
    console.error(error);
  }
}

sendMessage();

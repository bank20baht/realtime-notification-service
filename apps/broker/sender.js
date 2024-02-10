const amqp = require("amqplib");

async function sendMessage() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();
    const exchange = "direct_logs";
    const routingKey = "hello"; // Updated routing key

    // Assert the exchange exists or create it
    await channel.assertExchange(exchange, "direct", { durable: false });

    // Send a message every  5 seconds
    setInterval(() => {
      const message = new Date().toISOString(); // Current time as a string
      channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(`Sent: ${message}`);
    }, 5000); //  5000 milliseconds =  5 seconds
  } catch (error) {
    console.error(error);
  }
}

sendMessage();

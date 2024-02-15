import {
  Ctx,
  Get,
  JsonController,
  Param,
  RequestScopeContainer,
} from "@nipacloud/framework/core/http";
import { ContainerInstance } from "@nipacloud/framework/core/ioc";
import { Response, Context } from "koa";

import amqp from "amqplib";

// Define producerStreamMap as a global constant
const producerStreamMap = new Map();

@JsonController("/v1/notification")
export class ProducerController {
  @Get("/producer")
  public async getNotificationStream(
    @RequestScopeContainer() container: ContainerInstance,
    @Ctx() ctx: Context
  ) {
    const userId = "user1";
    const groupId = "group1";
    const subName = `${userId}.${groupId}`;
    const routingKeys = [`${userId}.*`, `*.${groupId}`];

    ctx.status = 200;
    ctx.set("Content-Type", "text/event-stream");
    ctx.set("Cache-Control", "no-cache");
    ctx.set("Connection", "keep-alive");
    ctx.res.write(":ok\n\n");

    // Check if the producer stream has already been created for this user ID
    let producerStream = producerStreamMap.get(subName);
    if (!producerStream) {
      // Create the producer stream and set up the AMQP connection
      producerStream = await this.setupProducerStream(routingKeys, subName);
      producerStreamMap.set(subName, producerStream);
    }

    producerStream.subscribe(ctx);

    ctx.req.on("close", () => {
      console.log("offline");
      producerStream.unsubscribe(ctx);
      ctx.res.end();
    });
    return new Promise(() => {});
  }

  private async setupProducerStream(
    bindingRoutingKey: string[],
    sumRoutingKey: string
  ) {
    const exchange = "topic_logs";
    const queue = "";

    const connection = await amqp.connect("amqp://admin:admin@localhost");
    const channel = await connection.createChannel();

    await channel.assertExchange(exchange, "topic", { durable: false }); // Assert topic exchange
    const { queue: q } = await channel.assertQueue(queue, { exclusive: true });

    for (const routingKey of bindingRoutingKey) {
      await channel.bindQueue(q, exchange, routingKey);
    }

    console.log(
      `Waiting for messages with routing key: ${bindingRoutingKey}. To exit press CTRL+C`
    );

    // Initialize the list of subscribers for this user ID
    const subscribers: any = {};
    subscribers[sumRoutingKey] = [];

    // Consume messages from the queue and broadcast them to all subscribers
    channel.consume(
      q,
      (msg) => {
        if (msg !== null) {
          console.log(`Received: ${msg.content.toString()}`);
          subscribers[sumRoutingKey].forEach((subscriber: any) => {
            this.sendEventToSubscriber(subscriber, msg.content.toString());
          });
        }
      },
      { noAck: true }
    );

    // Return an object with methods to manage the producer stream
    return {
      subscribe: (subscriber: any) => {
        subscribers[sumRoutingKey].push(subscriber);
      },
      unsubscribe: (subscriber: any) => {
        const index = subscribers[sumRoutingKey].indexOf(subscriber);
        if (index > -1) {
          subscribers[sumRoutingKey].splice(index, 1);
        }
        // If there are no more subscribers for this user ID, close the channel and connection
        if (subscribers[sumRoutingKey].length === 0) {
          channel.close();
          connection.close();
          // Remove the producer stream from the map
          producerStreamMap.delete(sumRoutingKey);
        }
      },
      close: () => {
        channel.close();
        connection.close();
      },
    };
  }

  private async sendEventToSubscriber(ctx: Context, data: string) {
    console.log(`data: ${JSON.stringify(data)}`);
    ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

import { Service } from "typedi";

import Container from "typedi";
import {
  RabbitMQConnector,
  RabbitMQConnectorIdentifier,
} from "../../utils/connections/RabbitMQConnector";

@Service()
export class NotificationService {
  async sendGroupNotification(group: string, message: string) {
    const exchange = "topic_logs";
    const routingKey = `*.${group}`;
    await this.sendMessage(exchange, routingKey, `group${group} : ${message}`);
  }

  async sendUserNotification(userId: string, message: string) {
    const exchange = "topic_logs";
    const routingKey = `${userId}.*`;
    await this.sendMessage(exchange, routingKey, `user${userId} : ${message}`);
  }

  async sendAnnouncementNotification(message: string) {
    const exchange = "topic_logs";
    const routingKey = `#`;
    await this.sendMessage(exchange, routingKey, `Announcement : ${message}`);
  }

  private async sendMessage(
    exchange: string,
    routingKey: string,
    content: string
  ) {
    const rabbitMQConnector = Container.get<RabbitMQConnector>(
      RabbitMQConnectorIdentifier
    );

    await rabbitMQConnector.channel.assertExchange(exchange, "topic", {
      durable: false,
    });
    await rabbitMQConnector.channel.publish(
      exchange,
      routingKey,
      Buffer.from(content)
    );
  }
}

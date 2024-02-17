import { Connection, Channel, connect } from "amqplib";
import { EventEmitter } from "events";
import { Token } from "typedi";

interface ConnectionDetails {
  hostname: string;
  port: number;
  username: string;
  password: string;
}

export class RabbitMQConnector extends EventEmitter {
  public connection!: Connection;
  public channel!: Channel;
  private retryCount: number = 0;
  private readonly maxRetries: number = 5;

  constructor(private readonly details: ConnectionDetails) {
    super();
  }

  async connect(): Promise<void> {
    try {
      this.connection = await connect({
        hostname: this.details.hostname,
        port: this.details.port,
        username: this.details.username,
        password: this.details.password,
      });
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
      this.retryCount++;
      if (this.retryCount > this.maxRetries) {
        this.emit("retryExceeded");
      } else {
        setTimeout(() => this.connect(), 5000);
      }
    }
  }

  async createChannel(): Promise<Channel> {
    if (!this.connection) {
      throw new Error("No connection available");
    }
    try {
      this.channel = await this.connection.createChannel();
      console.log("Channel created");
      return this.channel;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      throw new Error("Channel is not yet initialized");
    }
    return this.channel;
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log("Disconnected from RabbitMQ");
  }
}

export const RabbitMQConnectorIdentifier = new Token<RabbitMQConnector>();

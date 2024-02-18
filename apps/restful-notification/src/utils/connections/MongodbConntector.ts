import mongoose from "mongoose";
import dotenv from "dotenv";
import { Token } from "typedi";

dotenv.config();

interface MongoDBConnectionDetails {
  uri: string;
}

export class MongoDBConnector {
  private connection!: typeof mongoose;

  constructor(private readonly details: MongoDBConnectionDetails) {}

  async connect(): Promise<void> {
    try {
      this.connection = await mongoose.connect(this.details.uri);
      console.log("MongoDB Connected...");
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  getConnection(): typeof mongoose {
    if (!this.connection) {
      throw new Error("No connection available");
    }
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
    }
    console.log("Disconnected from MongoDB");
  }
}

export const MongoDBConnectorIdentifier = new Token<MongoDBConnector>();

import Container from "typedi";
import { ServerSentEventService } from "./ServerSentEventService";
import { Request, Response, NextFunction } from "express";

export class ServerSentEventController {
  private _serverSentEventService: ServerSentEventService;

  constructor() {
    this._serverSentEventService = Container.get(ServerSentEventService);
  }

  async getNotification(req: Request, res: Response, next: NextFunction) {
    const { project_id, user_id } = req.body;
    await this._serverSentEventService.getEvents(req, res, next);
  }
}

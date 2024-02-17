import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { NotificationService } from "./NotificationService";

export class NotificationController {
  private _notificationService: NotificationService;
  constructor() {
    this._notificationService = Container.get(NotificationService);
  }

  async sentGroupNotification(req: Request, res: Response, next: NextFunction) {
    const { project_id, description } = req.body;
    await this._notificationService.sendGroupNotification(
      project_id,
      description
    );
    res.status(201).send({ message: "send Group notification successful" });
  }

  async sentUserNotification(req: Request, res: Response, next: NextFunction) {
    const { user_id, description } = req.body;
    await this._notificationService.sendUserNotification(user_id, description);
    res.status(201).send({ message: "send User notification successful" });
  }

  async sentAnnouncementNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { description } = req.body;
    await this._notificationService.sendAnnouncementNotification(description);
    res
      .status(201)
      .send({ message: "send Announcement notification successful" });
  }
}

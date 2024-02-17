import Container from "typedi";
import { ServerSentEventService } from "./ServerSentEventService";
import { Request, Response, NextFunction } from "express";

export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serverSentEventService = Container.get(ServerSentEventService);
  await serverSentEventService.getEvents(req, res, next);
};

import express from "express";
import { ServerSentEventController } from "./ServerSentEventController";

const router = express.Router();
const serverSentEventController = new ServerSentEventController();
router.get("/check", (req, res) => {
  res.json({ message: "that work" });
});

router.get(
  "/events/:user_id/:group_id",
  serverSentEventController.getNotification.bind(serverSentEventController)
);

export default router;

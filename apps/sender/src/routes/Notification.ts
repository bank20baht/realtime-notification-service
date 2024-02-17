// routes.ts
import express from "express";
import { NotificationController } from "../controllers/Notification";

const router = express.Router();
const notificationController = new NotificationController(); // Instantiate NotificationController

router.post(
  "/user",
  notificationController.sentUserNotification.bind(notificationController)
);
router.post(
  "/project",
  notificationController.sentGroupNotification.bind(notificationController)
);
router.post(
  "/announcement",
  notificationController.sentAnnouncementNotification.bind(
    notificationController
  )
);

export default router;

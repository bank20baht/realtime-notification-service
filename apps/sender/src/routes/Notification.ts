import express from "express";
import {
  sentUserNotification,
  sentAnnouncementNotification,
  sentGroupNotification,
} from "../controllers/Notification";

const router = express.Router();

router.post("/user", sentUserNotification);
router.post("/project", sentGroupNotification);
router.post("/announcement", sentAnnouncementNotification);

export default router;

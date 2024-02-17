import express from "express";
import { getEvents } from "./ServerSentEventController";

const router = express.Router();

router.get("/check", (req, res) => {
  res.json({ message: "that work" });
});

router.get("/events/:user_id/:group_id", getEvents);

export default router;

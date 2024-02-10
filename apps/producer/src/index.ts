import express, { NextFunction, Request, Response } from "express";
const app = express();

app.get("/events", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(":ok\n\n");

  const intervalId = setInterval(() => {
    const data = new Date().toISOString();
    sendEventsToAll(res, data); // Passing Response object
  }, 5000);

  req.on("close", () => {
    console.log("offline");
    clearInterval(intervalId);
  });
});

function sendEventsToAll(res: Response, data: string) {
  // Change Request to Response
  console.log(`data: ${JSON.stringify(data)}`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Producer service listening at http://localhost:${PORT}`);
});

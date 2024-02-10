const express = require("express");
const app = express();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(":ok\n\n");

  const intervalId = setInterval(() => {
    const data = new Date().toISOString();
    sendEventsToAll(res, data); // Pass the 'res' object and data to the function
  }, 5000);

  // Clear interval when client connection is closed
  req.on("close", () => {
    console.log("offline");
    clearInterval(intervalId);
  });
});

function sendEventsToAll(res, data) {
  // Add 'res' and 'data' as parameters
  console.log(`data: ${JSON.stringify(data)}`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Producer service listening at http://localhost:${PORT}`);
});

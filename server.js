const express = require("express");
const app = express();

app.get("/consume", (req, res) => {
  // Set up EventSource to listen to the producer service's SSE endpoint
  const EventSource = require("eventsource");
  const producerUrl = "http://localhost:3000/events";
  const es = new EventSource(producerUrl);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(":ok\n\n");

  es.onmessage = (event) => {
    // Log the received event data to the console
    console.log(event.data);
  };

  es.onerror = (err) => {
    // Handle any errors that occur while connecting or receiving events
    console.error("EventSource error:", err);
  };

  req.on("close", () => {
    // Close the EventSource connection when the request is closed
    es.close();
  });

  // Respond immediately to indicate that the setup was successful
});

const CONSUMER_PORT = 3001;
app.listen(CONSUMER_PORT, () => {
  console.log(
    `Consumer service listening at http://localhost:${CONSUMER_PORT}`
  );
});

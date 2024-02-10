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

  es.onopen = () => {
    // Respond with a comment to indicate that the connection is open
    res.write(":connected\n\n");
  };

  es.onmessage = (event) => {
    // Send the event data to the client
    res.write(`data: ${event.data}\n\n`);
  };

  es.onerror = (err) => {
    // Handle errors
    console.error("EventSource error:", err);
    // Notify the client of the error
    res.status(500).end();
  };

  req.on("close", () => {
    // Close the EventSource connection when the request is closed
    es.close();
  });
});

const CONSUMER_PORT = 3003;
app.listen(CONSUMER_PORT, () => {
  console.log(
    `Consumer1 service listening at http://localhost:${CONSUMER_PORT}`
  );
});

import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 3000, // Number of virtual users
  duration: "30s", // Duration of the test
};

// Function to generate random message data
function generateMessageData() {
  const id = "1";
  const description = `Message for user ${id}`;
  return { id, description };
}

// Function to send a notification
export function sendNotification() {
  const data = generateMessageData();
  const url = "http://localhost:3001/notification";
  const payload = JSON.stringify(data);
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);
  check(res, {
    "Notification sent successfully": (r) => r.status === 201,
  });
}

// Function to check if the receiver is online
export function checkReceiverOnline() {
  const userId = "1"; // Random user id
  const url = `http://localhost:3002/consume/${userId}`;
  const params = {
    headers: {
      Accept: "text/event-stream",
    },
  };

  const res = http.get(url, params);
  check(res, {
    "Connected to SSE endpoint": (r) => r.status === 200,
  });
}

export default function () {
  // Each virtual user will send a notification and then check if the receiver is online
  sendNotification();
  checkReceiverOnline();
}

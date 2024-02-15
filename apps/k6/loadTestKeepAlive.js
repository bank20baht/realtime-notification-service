import http from "k6/http";
import { sleep } from "k6";
import { check } from "k6/http";

export let options = {
  vus: 3000, // Number of virtual users
  duration: "30s", // Duration of the test
};

// Function to generate random message data
function generateMessageData() {
  const user_id = "user1";
  const description = `Message for user ${user_id}`;
  const group_id = "group1";
  return { user_id, group_id, description };
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

// Function to simulate an SSE connection
export function simulateSSEConnection() {
  const userId = "user1"; // Random user id
  const groupId = "group1";
  const url = `http://localhost:3002/consume?user_id=${userId}&group_id=${groupId}`;
  const params = {
    headers: {
      Accept: "text/event-stream",
      Connection: "keep-alive",
    },
  };

  while (__VU > 0 && __ITER < options.iterations) {
    const res = http.get(url, params);
    check(res, {
      "Connected to SSE endpoint": (r) => r.status === 200,
    });

    // Simulate waiting for a message
    sleep(1);
  }
}

export default function () {
  // Each virtual user will send a notification and then simulate an SSE connection
  sendNotification();
  simulateSSEConnection();
}

"use client";

import { useState, useEffect, FC } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { IoIosNotifications } from "react-icons/io";
import CardComponent from "./components/CardComponent";

type Props = {
  params: {
    id: string;
  };
};
type NotificationData = {
  id: string;
  project_id: string;
  description: string;
  status: "unread" | "read";
  created_at: string;
  updated_at: string;
};

const mockProjects = [
  { id: "1", name: "Project A", description: "This is Project A." },
  { id: "2", name: "Project B", description: "This is Project B." },
];

const SelectProjectPage: FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");

  const params_id = 1;

  const [historyNotification, setHistoryNotification] = useState<
    NotificationData[]
  >([]);
  const [openModal, setOpenModal] = useState(false);

  const userId = "user1";
  const groupId = "group1";
  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_API_SSE_HOST}/events/user1/`
    );

    eventSource.addEventListener("message", (event) => {
      const newNotification = event.data;
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]);
      toast(newNotification);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="flex flex-wrap justify-center items-center h-screen bg-gray-100">
      {mockProjects.map((project) => (
        <CardComponent key={project.id} project={project} />
      ))}
      <ToastContainer position="bottom-left" hideProgressBar autoClose={5000} />
    </div>
  );
};

export default SelectProjectPage;

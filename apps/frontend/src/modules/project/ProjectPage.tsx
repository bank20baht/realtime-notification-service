"use client";

import React, { useState, useEffect, FC } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment";
import { IoIosNotifications } from "react-icons/io";
import { useParams } from "react-router-dom";
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

const ProjectPage: FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");

  let { project_id } = useParams();

  const params_id = 1;

  const [historyNotification, setHistoryNotification] = useState<
    NotificationData[]
  >([]);
  const [openModal, setOpenModal] = useState(false);

  const userId = "user1";

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3002/consume?user_id=${userId}&group_id=${project_id}`
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
    <div className=" h-[100dvh]">
      <nav className="bg-white text-black shadow py-2"></nav>
      <div className="text-6xl font-bold text-gray-400 flex justify-center items-center h-full">
        Demo Application for 240-404 Internship Project
        <br />
        User#{params_id}
        <br />
        Project Id#{project_id}
      </div>
      <ToastContainer
        theme="dark"
        position="bottom-left"
        hideProgressBar
        autoClose={5000}
      />
    </div>
  );
};

export default ProjectPage;

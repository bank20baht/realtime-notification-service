"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment";
import { IoIosNotifications } from "react-icons/io";
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

const App = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");

  const params_id = 1;

  const [historyNotification, setHistoryNotification] = useState<
    NotificationData[]
  >([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:3002/consume/" + params_id
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
      <nav className="bg-white text-black shadow py-2">
        <div className="flex justify-end">
          <div
            className="bg-blue-800 flex justify-center   text-white rounded-full w-6 h-6 text-center align-middle items-center mr-3"
            onClick={() => {
              setOpenModal(!openModal);
            }}
          >
            <IoIosNotifications />
          </div>
          {openModal && (
            <div className="absolute right-3 bg-white shadow-md rounded-md w-[300px] h-[max-content] top-[2.8rem] p-3 z-50">
              <div className="relative ">
                <div>Notification </div>
                <div className="flex">
                  <div
                    className={`${
                      filter == "All" && "bg-blue-200"
                    } py-2 px-5 rounded-xl cursor-pointer`}
                    onClick={() => {
                      setFilter("All");
                    }}
                  >
                    All
                  </div>
                  <div
                    className={`${
                      filter == "Unread" && "bg-blue-200"
                    } py-2 px-5 rounded-xl  cursor-pointer`}
                    onClick={() => {
                      setFilter("Unread");
                    }}
                  >
                    Unread
                  </div>
                </div>
                <div className="flex flex-col relative h-96 overflow-y-auto">
                  {historyNotification.map((element) => {
                    return (
                      <div
                        onClick={() => {}}
                        className={`p-3 flex justify-between items-center ${
                          element.status === "unread" ? "bg-gray-100" : ""
                        } my-2 rounded-lg cursor-pointer hover:bg-gray-200`}
                        key={element.id}
                      >
                        <div className="">
                          <div className="flex  text-sm">
                            <div>{element.description}</div>
                          </div>
                          <div className="flex  mt-1 ">
                            <div className="text-gray-400 text-xs ">
                              {moment(element.created_at).fromNow()}
                            </div>
                          </div>
                        </div>
                        <div className="">
                          {element.status == "unread" && (
                            <div className="w-[10px] h-[10px] bg-blue-500 rounded-full ml-5"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="text-6xl font-bold text-gray-400 flex justify-center items-center h-full">
        Demo Application for 240-404 Internship Project
        <br />
        User#{params_id}
      </div>
      <ToastContainer position="bottom-left" hideProgressBar autoClose={5000} />
    </div>
  );
};

export default App;

import { useState, useEffect, FC } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment";
import { IoIosNotifications } from "react-icons/io";
import { useParams } from "react-router-dom";

type NotificationData = {
  notification_id: string;
  receiver_id: string;
  description: string;
  status: "unread" | "read";
  created_at: string;
  updated_at: string;
};

const ProjectPage: FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");

  const { project_id } = useParams();

  const [historyNotification, setHistoryNotification] = useState<
    NotificationData[]
  >([]);
  const [openModal, setOpenModal] = useState(false);

  const fetchNotification = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API_REST_HOST}/notification?receiver_id=${project_id}`
    );
    setHistoryNotification(response.data);
  };

  const fetchNotificationUnread = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API_REST_HOST}?receiver_id=${project_id}&status=unread`
    );
    setHistoryNotification(response.data);
  };
  useEffect(() => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_API_SSE_HOST}/events/user1/${project_id}`
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

  useEffect(() => {
    fetchNotification();
  }, [notifications, openModal]);

  const handleNotificationClick = async (notification_id: string) => {
    await axios.patch(
      `${import.meta.env.VITE_APP_API_REST_HOST}/notification/${notification_id}`,
      {
        status: "read",
      }
    );

    setHistoryNotification((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.notification_id === notification_id
          ? { ...notification, status: "read" }
          : notification
      )
    );
  };

  return (
    <div className=" h-[100dvh]">
      <nav className="bg-white text-black shadow py-2">
        <div className="flex justify-end">
          <div
            className="bg-blue-800 flex justify-center   text-white rounded-full w-6 h-6 text-center align-middle items-center mr-3"
            onClick={() => {
              setOpenModal(!openModal);
              fetchNotification();
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
                      fetchNotification();
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
                      fetchNotificationUnread();
                    }}
                  >
                    Unread
                  </div>
                </div>
                <div className="flex flex-col relative h-96 overflow-y-auto">
                  {historyNotification.map((element) => {
                    return (
                      <div
                        onClick={() =>
                          handleNotificationClick(element.notification_id)
                        }
                        className={`p-3 flex justify-between items-center ${
                          element.status === "unread" ? "bg-gray-100" : ""
                        } my-2 rounded-lg cursor-pointer hover:bg-gray-200`}
                        key={element.notification_id}
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
        ProjectID#{project_id}
        <br />
        UserID#1
      </div>
      <ToastContainer position="bottom-left" hideProgressBar autoClose={5000} />
    </div>
  );
};

export default ProjectPage;

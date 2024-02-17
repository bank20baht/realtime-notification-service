import { useState, useEffect, FC } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CardComponent from "./components/CardComponent";

const mockProjects = [
  { id: "1", name: "Project A", description: "This is Project A." },
  { id: "2", name: "Project B", description: "This is Project B." },
];

const SelectProjectPage: FC = () => {
  const [, setNotifications] = useState<string[]>([]);

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

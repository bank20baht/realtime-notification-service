import { FC, useState } from "react";

const LoginPage: FC = () => {
  const [username, setUsername] = useState("");

  const handleSubmit = (event: any) => {
    event.preventDefault();
    localStorage.setItem("username", username);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
    >
      <label
        htmlFor="username"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Username:
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-3 py-2 mb-4 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Login
      </button>
    </form>
  );
};

export default LoginPage;

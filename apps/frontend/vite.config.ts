import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https:1//vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});

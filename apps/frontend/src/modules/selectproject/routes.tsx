import { FC, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SelectProjectPage from "./SelectProject";

const SelectProject = lazy(() => import("./SelectProject"));

export const SelectProjectRoutes: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<SelectProject />} />
      </Routes>
    </Suspense>
  );
};

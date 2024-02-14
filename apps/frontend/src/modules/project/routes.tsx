import { FC, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const ProjectPage = lazy(() => import("./ProjectPage"));

export const ProjectRoutes: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/*" element={<ProjectPage />} />
      </Routes>
    </Suspense>
  );
};

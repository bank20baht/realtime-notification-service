import { FC, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const LoginPage = lazy(() => import("./loginPage"));

export const LoginRoutes: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
};

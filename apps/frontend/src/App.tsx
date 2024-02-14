import { Route, Routes, useLocation } from "react-router-dom";
import { SelectProjectRoutes } from "./modules/selectproject";
import { ProjectRoutes } from "./modules/project";
import { LoginRoutes } from "./modules/login";

function App() {
  const location = useLocation();
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<SelectProjectRoutes />} />
        <Route path="/project/:project_id" element={<ProjectRoutes />} />
        <Route path="/login" element={<LoginRoutes />} />
      </Routes>
    </>
  );
}

export default App;

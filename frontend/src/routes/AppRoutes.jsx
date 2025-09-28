import { BrowserRouter, Routes, Route } from "react-router-dom";
import {MainPage} from "../pages/MainPage";
import {SignInPage} from "../pages/SignInPage";
import {EmployeeCabinetPage} from "../pages/EmployeeCabinetPage";
import {AdminPage} from "../pages/AdminPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/employee" element={<EmployeeCabinetPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

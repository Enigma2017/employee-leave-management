import { BrowserRouter, Routes, Route } from "react-router-dom";
import {MainPage} from "../pages/MainPage";
import {SignInPage} from "../pages/SignInPage";
import {EmployeeCabinetPage} from "../pages/EmployeeCabinetPage";
import {AdminPage} from "../pages/AdminPage";
import {ApplicationFormPage} from "../pages/ApplicationFormPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/employee" element={<EmployeeCabinetPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/application" element={<ApplicationFormPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

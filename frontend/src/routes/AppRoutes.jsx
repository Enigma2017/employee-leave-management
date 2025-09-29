import { BrowserRouter, Routes, Route } from "react-router-dom";
import {MainPage} from "../pages/MainPage";
import {SignInPage} from "../pages/SignInPage";
import {EmployeeCabinetPage} from "../pages/EmployeeCabinetPage";
import {AdminPage} from "../pages/AdminPage";
import {Navbar} from "../components/Navbar";

function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/employee" element={<EmployeeCabinetPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

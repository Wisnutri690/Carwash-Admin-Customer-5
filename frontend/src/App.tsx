import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import CustomerList from "./pages/Customer/CustomerList";
import VehicleList from "./pages/Vehicle/VehicleList";
import ServiceList from "./pages/Service/ServiceList";
import StaffList from "./pages/Staff/StaffList";
import OrderList from "./pages/Order/OrderList";
import NotFound from "./pages/notFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/staff" element={<StaffList />} />
            <Route path="/orders" element={<OrderList />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

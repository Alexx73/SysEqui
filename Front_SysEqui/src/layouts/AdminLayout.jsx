import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ Usa tu propio hook
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const { userData } = useUser(); // ✅ Usa userData como lo definiste
  if (!userData || userData.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar />
      <main className="flex-1 p-6 mx-3">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;


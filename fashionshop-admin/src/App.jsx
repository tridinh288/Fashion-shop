import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/authStore";
import AdminLayout from "./components/layout/AdminLayout";

import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import Products   from "./pages/Products";
import Orders     from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Users      from "./pages/Users";
import Reviews    from "./pages/Reviews";
import Contacts   from "./pages/Contacts";
import HomeCovers from "./pages/HomeCovers";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/"           element={<Dashboard />}  />
        <Route path="/products"   element={<Products />}   />
        <Route path="/orders"     element={<Orders />}     />
        <Route path="/orders/:id" element={<OrderDetail />}/>
        <Route path="/users"      element={<Users />}      />
        <Route path="/reviews"    element={<Reviews />}    />
        <Route path="/contacts"   element={<Contacts />}   />
        <Route path="/covers"     element={<HomeCovers />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

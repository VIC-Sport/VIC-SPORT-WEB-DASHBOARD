import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/global.scss";
import { App, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/auth/login";
import ProtectedRoute from "./components/auth";
import LayoutAdmin from "./layouts/layout.admin";
import DashBoardPage from "./pages/admin/dashboard";
import ManageUserPage from "./pages/admin/manage.user";
import { AppProvider } from "./components/context/app.context";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />
  },
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserPage />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <ConfigProvider locale={enUS}>
            <RouterProvider router={router} />
          </ConfigProvider>
        </GoogleOAuthProvider>
      </AppProvider>
    </App>
  </StrictMode>
);

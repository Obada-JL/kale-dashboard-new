import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./Components/Auth/LoginPage";
import MainPage from "./Components/MainPage";
import PageLayout from "./PageLayout";
import NotFound from "./Components/404Page";
import UsersPage from "./Components/Pages/UsersPage";
import DrinksPage from "./Components/Pages/DrinksPage";
import FoodsPage from "./Components/Pages/FoodsPage";
import DessertsPage from "./Components/Pages/DessertsPage";
import HookahPage from "./Components/Pages/HookahPage";
import SpecialImagesPage from "./Components/Pages/SpecialImagesPage";
import TablesPage from "./Components/Pages/TablesPage";
import OrderLogsPage from "./Components/Pages/OrderLogsPage";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ConfirmProvider } from "./Components/ConfirmDialog";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <PageLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <MainPage /> },
        { path: "/users", element: <UsersPage /> },
        { path: "/drinks", element: <DrinksPage /> },
        { path: "/foods", element: <FoodsPage /> },
        { path: "/desserts", element: <DessertsPage /> },
        { path: "/hookah", element: <HookahPage /> },
        { path: "/special-images", element: <SpecialImagesPage /> },
        { path: "/tables", element: <TablesPage /> },
        { path: "/order-logs", element: <OrderLogsPage /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <ConfirmProvider>
        <RouterProvider router={router} />
      </ConfirmProvider>
    </AuthProvider>
  );
}

export default App;

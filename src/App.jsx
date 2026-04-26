import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
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
import { useAuth } from "./context/AuthContext";

// Redirects employees to /tables, allows other roles through
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'staff') {
    return <Navigate to="/tables" replace />;
  }
  return children;
};

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
        { path: "/", element: <AdminRoute><MainPage /></AdminRoute> },
        { path: "/users", element: <AdminRoute><UsersPage /></AdminRoute> },
        { path: "/drinks", element: <AdminRoute><DrinksPage /></AdminRoute> },
        { path: "/foods", element: <AdminRoute><FoodsPage /></AdminRoute> },
        { path: "/desserts", element: <AdminRoute><DessertsPage /></AdminRoute> },
        { path: "/hookah", element: <AdminRoute><HookahPage /></AdminRoute> },
        { path: "/special-images", element: <AdminRoute><SpecialImagesPage /></AdminRoute> },
        { path: "/tables", element: <TablesPage /> },
        { path: "/order-logs", element: <AdminRoute><OrderLogsPage /></AdminRoute> },
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


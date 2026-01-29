import "./App.css";

import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import AdminNavbar from "./components/AdminNavbar/AdminNavbar";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import MainPage from "./page/MainPage/MainPage";
import Request from "./page/Request/Request";
import Notice from "./page/Notice/Notice";
import NoticeDetail from "./page/Notice/NoticeDetail";
import Contact from "./page/Contact/Contact";
import AdminContacts from "./page/Admin/AdminContacts";
import AdminNotices from "./page/Admin/AdminNotices";
import AdminCreatenotice from "./page/Admin/AdminCreatenotice";
import AdminModifynotice from "./page/Admin/AdminModifynotice";
import AdminRequests from "./page/Admin/AdminRequests";
import AdminRequestDetail from "./page/Admin/AdminRequestDetail";
import AdminAccessCard from "./page/Admin/AdminAccessCard";
import AdminAccessCardDetail from "./page/Admin/AdminAccessCardDetail";
import AdminCardManagement from "./page/Admin/AdminCardManagement";
import AdminStatistics from "./page/Admin/AdminStatistics";

// import AdminLogin from "./page/Admin/AdminLogin";
// import { useEffect, useState } from "react";
// import AdminCreatepost from "./page/Admin/AdminCreatepost";
// import AdminEditPost from "./page/Admin/AdminEditPost";
// import AdminContacts from "./page/Admin/AdminContacts";
// import AdminPosts from "./page/Admin/AdminPosts";

// function AuthRedirectRoute() {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   useEffect(() => {
//     const verifyToken = async () => {
//       try {
//         const response = await axios.post(
//           "http://localhost:3000/api/auth/verify-token",
//           {},
//           { withCredentials: true }
//         );
//         setIsAuthenticated(true);
//       } catch (error) {
//         console.log("토큰 인증 실패: " + error);
//         setIsAuthenticated(false);
//       }
//     };
//     verifyToken();
//   }, []);

//   if (isAuthenticated === null) {
//     return null;
//   }

//   return isAuthenticated ? <Navigate to="/admin/posts" replace /> : <Outlet />;
// }

// function ProtectedRoute() {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const verifyToken = async () => {
//       try {
//         const response = await axios.post(
//           "http://localhost:3000/api/auth/verify-token",
//           {},
//           { withCredentials: true }
//         );
//         setIsAuthenticated(response.data.isValid);
//         setUser(response.data.user);
//       } catch (error) {
//         console.log("토큰 인증 실패: " + error);
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     };
//     verifyToken();
//   }, []);

//   if (isAuthenticated === null) {
//     return null;
//   }

//   return isAuthenticated ? (
//     <Outlet context={{ user }} />
//   ) : (
//     <Navigate to="/admin" replace />
//   )
// }

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function AdminLayout() {
  return (
    <>
      <ScrollToTop />
      <AdminNavbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "request",
        element: <Request />,
      },
      {
        path: "notice",
        element: <Notice />,
      },
      {
        path: "notice/:id",
        element: <NoticeDetail />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminContacts />,
      },
      {
        path: "contacts",
        element: <AdminContacts />
      },
      {
        path: "notices",
        element: <AdminNotices/>,
      },
      {
        path: "create-notice",
        element: <AdminCreatenotice />,
      },
      {
        path: "modify-notice/:id",
        element: <AdminModifynotice />,
      },
      {
        path: "requests",
        element: <AdminRequests />,
      },
      {
        path: "detail-request/:id",
        element: <AdminRequestDetail />,
      },
      {
        path: "accessCard",
        element: <AdminAccessCard />,
      },
      {
        path: "detail-accessCard/:id",
        element: <AdminAccessCardDetail />,
      },
      {
        path: "cardManagement",
        element: <AdminCardManagement />,
      },
      {
        path: "statistics",
        element: <AdminStatistics />,
      },
    ],
  },
  // {
  //   path: "/admin",
  //   element: <AuthRedirectRoute />,
  //   children: [{ index: true, element: <AdminLogin /> }],
  // },
  // {
  //   path: "/admin",
  //   element: <ProtectedRoute />,
  //   children: [
  //     {
  //       element: <AdminLayout />,
  //       children: [
  //         {
  //           path: "posts",
  //           element: <AdminPosts />,
  //         },
  //         {
  //           path: "create-post",
  //           element: <AdminCreatepost />,
  //         },
  //         {
  //           path: "edit-post/:id",
  //           element: <AdminEditPost />,
  //         },
  //         {
  //           path: "contacts",
  //           element: <AdminContacts />,
  //         },
  //       ],
  //     },
  //   ],
  // },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

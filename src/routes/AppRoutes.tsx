import { Routes, Route } from "react-router-dom";

import AuthLayout from "@/Layout/AuthLayout";
import AdminLayout from "@/Layout/AdminLayout";
import LandingLayout from "@/Layout/LandingLayout";
import { CustomerLayout } from "@/Layout/CustomerLayout";

import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/admin/dashboard/Dashboard";
import SignUp from "@/pages/auth/SignUp";
import { ProfilePage } from "@/pages/customer/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import CustomerDashboard from "@/pages/customer/Dashboard";
import Unauthorized from "@/components/Unauthorized";
import Blog from "@/pages/blog/BlogList";
import BlogDetails from "@/pages/blog/BlogDetails";
import BlogList from "@/pages/admin/blog/BlogList";
import NewBlog from "@/pages/admin/blog/NewBlog";
import Category from "@/pages/admin/Category/Category";
import LatestBlogs from "@/pages/blog/LatestBlogs";
import BlogCommentModeration from "@/pages/admin/blog/BlogCommentModeration";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing */}
      <Route element={<LandingLayout />}>
        <Route index element={<Home />} />
        <Route path="blogs" element={<Blog />} />
        <Route path="blogs/:slug" element={<BlogDetails />} />
        <Route path="blogs/latest-posts" element={<LatestBlogs />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Route>

      <Route path="unauthorized" element={<Unauthorized />} />

      {/* 👇 ADMIN - Role protected at layout */}
      <Route
        element={<ProtectedRoute allowedRoles={["admin", "superAdmin"]} />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="blogs" element={<BlogList />} />
          <Route path="blogs/new" element={<NewBlog />} />
          <Route path="categories" element={<Category />} />
          <Route path="blogs/comments" element={<BlogCommentModeration />} />

          {/* <Route path="unauthorized" element={<Unauthorized />} /> */}
        </Route>
      </Route>

      {/* 👇 CUSTOMER - Role protected at layout */}
      <Route
        element={<ProtectedRoute allowedRoles={["customer", "employee"]} />}
      >
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

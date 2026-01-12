import { Outlet } from "react-router-dom";
import LandingHeader from "@/components/LandingHeader";
const AuthLayout = () => {
  return (
    <div className="h-screen overflow-hidden">
      <LandingHeader />
      <div className="auth-layout">
        <section className="auth-left-section hidden md:flex"></section>
        <section className="auth-right-section">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;

import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";
import LandingHeader from "@/components/LandingHeader";

const LandingLayout = () => {
  return (
    <>
      <div>
        <LandingHeader />
        <Outlet />
        <Footer />
      </div>
    </>
  );
};

export default LandingLayout;

import { NavLink } from "react-router-dom";
import SignOutButton from "../SignOutButton";
const Header = () => {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-bold">MyApp</h1>

      <nav className="flex gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "font-semibold text-blue-600" : "text-gray-600"
          }
        >
          Home
        </NavLink>
        <SignOutButton />
      </nav>
    </header>
  );
};

export default Header;

import { NavLink } from "react-router-dom";
import SignOutButton from "./SignOutButton";
const Header = () => {
  const links = [
    { to: "/", label: "Home" },
    { to: "/login", label: "Login" },
    { to: "/sign-up", label: "Sign Up" },
  ];
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-bold">MyApp</h1>

      <nav className="flex gap-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "font-semibold text-blue-600" : "text-gray-600"
            }
          >
            {link.label}
          </NavLink>
        ))}
        <SignOutButton />
      </nav>
    </header>
  );
};

export default Header;

import { NavLink } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { FiMenu } from "react-icons/fi";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const links = [{ to: "/blogs", label: "Blog" }];
  return (
    <header
      className={`bg-white shadow-md dark:bg-gray-900 ${isDarkMode ? "dark" : ""}`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          <img
            src="/logo_1.svg"
            alt="logo"
            width={200}
            // height={30}
          />
        </div>

        <nav className="hidden gap-4 md:flex">
          {links.map((link) => (
            <NavLink
              to={link.to}
              key={link.to}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex">
          <div className="flex items-center space-x-4">
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/sign-up"
                  className={({ isActive }) =>
                    isActive
                      ? "hidden font-semibold text-blue-600 md:block dark:text-blue-400"
                      : "hidden text-gray-600 md:block dark:text-gray-400"
                  }
                >
                  Sign Up
                </NavLink>
              </>
            )}
            <div className="hidden md:block">{user && <SignOutButton />}</div>
            <button
              onClick={toggleTheme}
              className="rounded-full bg-gray-200 p-2 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
            >
              {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
            </button>
            {user && (
              <div className="relative hidden md:block">
                <button className="h-10 w-10 overflow-hidden rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <NavLink to="/customer">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </NavLink>
                </button>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className={`mr-3 rounded p-2 hover:bg-gray-200 md:hidden dark:hover:bg-gray-700`}
          >
            <FiMenu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

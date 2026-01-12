import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
const SIgnOutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="block text-gray-600 dark:text-gray-400"
    >
      Logout
    </button>
  );
};

export default SIgnOutButton;

// import { useProfile } from "@/hooks/useProfile";
// import { useAuth } from "@/hooks/useAuth";
const Dashboard = () => {
  // const { profile } = useProfile();
  // const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-400 p-10 dark:bg-slate-600">
      <h1 className="mb-4 text-xl">Debug Dashboard</h1>

      <p className="mt-4 text-sm text-gray-500">
        (Open your browser console with F12 to see the results)
      </p>
    </div>
  );
};

export default Dashboard;

import { LikedPostsDashboard } from "@/components/blog/LikedPostsDashboard";

const Dashboard = () => {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Customer Dashboard
      </h1>

      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Liked Posts
        </h2>
        <LikedPostsDashboard initialLimit={20} loadMoreLimit={20} />
      </div>
    </div>
  );
};

export default Dashboard;

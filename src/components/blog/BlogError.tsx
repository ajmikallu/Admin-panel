export function BlogError({ message }: { message?: string | null }) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded bg-white p-6 text-center shadow">
          <h2 className="text-xl font-bold">Post Not Found</h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
      </div>
    );
  }
  
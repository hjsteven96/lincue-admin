import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Total Users
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">-</p>
                    <p className="text-sm text-gray-700 mt-1">
                        All registered users
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Total Videos
                    </h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">-</p>
                    <p className="text-sm text-gray-700 mt-1">
                        Videos in database
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">
                        Analysis Count
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">-</p>
                    <p className="text-sm text-gray-700 mt-1">
                        Total analyses performed
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/users"
                        className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="font-medium text-gray-900">
                            Manage Users
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                            View and edit user accounts and plans
                        </p>
                    </Link>
                    <Link
                        href="/admin/videos/new"
                        className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                        <h3 className="font-medium text-gray-900">Add Video</h3>
                        <p className="text-sm text-gray-700 mt-1">
                            Manually register a new video analysis
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

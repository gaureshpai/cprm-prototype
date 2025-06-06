import Link from "next/link"

export default function DisplayNotFound() {
    return (
        <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="text-6xl mb-4">🖥️</div>
                <h1 className="text-3xl font-bold text-yellow-600 mb-4">Display Not Found</h1>
                <div className="bg-yellow-100 p-4 rounded-lg mb-6">
                    <p className="text-yellow-800">
                        The requested display could not be found. It may have been removed or the ID is incorrect.
                    </p>
                </div>
                <p className="text-gray-600 mb-6">Please check the display ID or contact your administrator.</p>
                <div className="space-y-3">
                    <Link
                        href="/admin/displays"
                        className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Display Management
                    </Link>
                    <Link
                        href="/"
                        className="block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

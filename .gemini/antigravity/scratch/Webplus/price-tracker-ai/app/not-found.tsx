import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h2 className="text-6xl font-bold text-gray-900">404</h2>
                <h3 className="text-2xl font-semibold text-gray-700">Page Not Found</h3>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

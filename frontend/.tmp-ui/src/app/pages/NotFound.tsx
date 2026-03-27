import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { HeartPulse, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-12 h-12 text-teal-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              HealthCura
            </h1>
          </div>
        </div>

        {/* 404 Message */}
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-9xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
            404
          </h2>
          <h3 className="text-2xl font-bold mb-4">Page Not Found</h3>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90 h-12 px-8">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

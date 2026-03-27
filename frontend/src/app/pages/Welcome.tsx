import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { HeartPulse, Stethoscope, Calendar, Shield } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-teal-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            HealthCura
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              Modern Healthcare Platform
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
              Your Health,{" "}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Our Priority
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Connect with trusted healthcare professionals. Book appointments seamlessly. 
              Manage your health records securely. Experience healthcare reimagined.
            </p>

            {/* User Type Selection */}
            <div className="space-y-4 pt-6">
              <p className="text-sm font-medium text-gray-700">Continue as:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Patient Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-teal-500 transition-all">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Patient</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Book appointments and manage your health
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Link to="/user/login" className="block">
                        <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:opacity-90">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/user/register" className="block">
                        <Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Doctor Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-blue-500 transition-all">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Doctor</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage appointments and patient care
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Link to="/doctor/login" className="block">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/doctor/register" className="block">
                        <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                          Register as Doctor
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzczOTQzNjE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern Healthcare"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Trusted Doctors</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            {
              icon: Calendar,
              title: "Easy Booking",
              description: "Schedule appointments with just a few clicks",
              color: "teal"
            },
            {
              icon: Stethoscope,
              title: "Expert Doctors",
              description: "Access to verified healthcare professionals",
              color: "blue"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Your health data is encrypted and protected",
              color: "purple"
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

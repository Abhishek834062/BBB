import { Link } from 'react-router-dom'
import { Droplets, Phone, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Bharat Blood Bank</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India's national blood bank management platform connecting donors,
              hospitals, and blood banks to save lives across the country.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-red-500" />
              <span>Emergency: 104 (National Blood Helpline)</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Mail className="h-4 w-4 text-red-500" />
              <span>support@bharatbloodbank.in</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/"           className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/find-blood" className="hover:text-white transition-colors">Find Blood</Link></li>
              <li><Link to="/banks"      className="hover:text-white transition-colors">Blood Banks</Link></li>
              <li><Link to="/login"      className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Register Blood Bank</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Doctor Registration</Link></li>
              <li><Link to="/login"    className="hover:text-white transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Bharat Blood Bank. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for India
          </p>
        </div>
      </div>
    </footer>
  )
}

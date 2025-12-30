'use client'

import { useState } from 'react'
import { Music, Eye, EyeOff } from 'lucide-react'

interface AuthScreenProps {
  onComplete: (socialData?: {
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  }) => void







  
}

export default function AuthScreen({ onComplete }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    birthday: '',
    
    // Location Information
    region: '',
    zone: '',
    church: '',
    
    // Ministry Information
    designation: '',
    administration: '',
    
    // Contact Information
    email: '',
    phoneNumber: '',
    password: '',
    
    // Social Login
    socialProvider: '',
    socialId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just complete the auth flow
    onComplete()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSocialSignup = (provider: 'google' | 'kingschat', e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (provider === 'google') {
      // Google integration - placeholder for future implementation
      alert('Google integration coming soon!')
      return
    }
    
    if (provider === 'kingschat') {
      // KingsChat integration - placeholder for future implementation
      alert('KingsChat integration coming soon!')
      return
    }
  }


  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto relative">
     

      {/* Main Content */}
      <div className="min-h-screen flex flex-col justify-center px-8 py-8 relative z-10">
        {/* App Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="LoveWorld Praise Logo" 
              className="object-contain"
              style={{ width: '120px', height: '120px' }}
            />
          </div>
          
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              // Login Form
              <>
                {/* Email field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

              </>
            ) : (
              // Signup - Social Login Options Only
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm">Choose your preferred signup method</p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-4">
                  {/* Google Signup */}
                  <button
                    type="button"
                    onClick={(e) => handleSocialSignup('google', e)}
                    className="w-full py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target"
                  >
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">G</span>
                    </div>
                    <span>Continue with Google</span>
                  </button>

                  {/* KingsChat Signup */}
                  <button
                    type="button"
                    onClick={(e) => handleSocialSignup('kingschat', e)}
                    className="w-full py-4 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target rounded-xl"
                  >
                    <img 
                      src="/kingschat.jpeg" 
                      alt="KingsChat" 
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>Sign up with KingsChat</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button - Only for Login */}
            {isLogin && (
              <button
                type="submit"
                className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl touch-target hover:bg-purple-700"
              >
                Sign In
              </button>
            )}
          </form>

          {/* Social Login Buttons for Login - Below Sign In Button */}
          {isLogin && (
            <div className="mt-8 space-y-3">
              <button className="w-full py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">G</span>
                </div>
                <span>Continue with Google</span>
              </button>

              <button className="w-full py-4 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">K</span>
                </div>
                <span>Login with KingsChat</span>
              </button>
            </div>
          )}

          {/* Toggle between Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-gray-800 transition-colors text-base"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
                      </div>
          </div>
      </div>
    </div>
  )
}

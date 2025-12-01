'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { KingsChatAuthService } from '@/lib/kingschat-auth'
import { AccountLinkingService } from '@/lib/account-linking'
import AuthCheck from '@/components/AuthCheck'
// Removed Supabase import - using Firebase now

// Helper function to convert Firebase errors to user-friendly messages
function sanitizeError(error: string): string {
  // Remove Firebase-specific terms
  const sanitized = error
    .replace(/firebase/gi, '')
    .replace(/auth\//gi, '')
    .replace(/\(auth\/.*?\)/gi, '')
    .trim()
  
  // Map common Firebase errors to friendly messages
  const errorMap: Record<string, string> = {
    'user-not-found': 'No account found with this email. Please check your email or create a new account.',
    'wrong-password': 'Incorrect password. Please try again or reset your password.',
    'invalid-email': 'Please enter a valid email address.',
    'email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'weak-password': 'Password is too weak. Please use at least 6 characters.',
    'too-many-requests': 'Too many failed attempts. Please try again in a few minutes.',
    'network-request-failed': 'Network error. Please check your internet connection and try again.',
    'invalid-credential': 'Invalid login credentials. Please check your email and password.',
    'user-disabled': 'This account has been disabled. Please contact support.',
    'operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'requires-recent-login': 'Please sign in again to continue.',
  }
  
  // Check if error contains any known Firebase error codes
  for (const [code, message] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(code)) {
      return message
    }
  }
  
  // If no specific match, return a generic message
  if (error.toLowerCase().includes('error') || error.toLowerCase().includes('failed')) {
    return 'Something went wrong. Please try again.'
  }
  
  return sanitized || 'An unexpected error occurred. Please try again.'
}

// Special senior HQ logins: allow name-based "email" that maps to internal emails
// NOTE: These require matching Firebase Auth users with these email addresses.
const SPECIAL_LOGIN_MAP: Record<string, { email: string }> = {
  // Senior HQ zones (have their own zones but are HQ groups, not necessarily HQ admins)
  'the president': { email: 'president@loveworldhq.org' },
  'the director': { email: 'director@loveworldhq.org' },
  'pst daba': { email: 'oftp.daba@loveworldhq.org' },
  'pst bisola': { email: 'oftp.bisola@loveworldhq.org' },
  'pst rita': { email: 'oftp.rita@loveworldhq.org' },
}

function AuthPageContent() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCheckingAccount, setIsCheckingAccount] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [zoneInvitationCode, setZoneInvitationCode] = useState('')
  const [zoneName, setZoneName] = useState<string | null>(null)
  const [isCoordinator, setIsCoordinator] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    zoneCode: '',
    kingschatId: '',
    birthday: '',
    profileImage: null as File | null
  })
  const [isFetchingKingsChat, setIsFetchingKingsChat] = useState(false)
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [multipleAccounts, setMultipleAccounts] = useState<any[]>([])
  const [pendingKingschatId, setPendingKingschatId] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [accountPassword, setAccountPassword] = useState('')

  // NO AUTH CHECK - Zustand auth store handles redirects
  // This prevents loops completely

  // Check for URL error parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    const urlMessage = urlParams.get('message')

    if (urlError && urlMessage) {
      setError(urlMessage)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Validate zone code when user types
  const handleZoneCodeChange = async (code: string) => {
    setFormData(prev => ({ ...prev, zoneCode: code }))
    setZoneInvitationCode(code)
    
    if (code.length >= 6) {
      // Get zone name from config
      const { getZoneByInvitationCode } = await import('@/config/zones')
      const zone = getZoneByInvitationCode(code)
      if (zone) {
        // Show special message for Central Admin zone
        if (zone.id === 'zone-boss') {
          setZoneName('Central Admin - Full Access to All Zones')
          setIsCoordinator(true) // Central Admin has elevated privileges
        } else {
          setZoneName(zone.name)
        }
        setError('')
      } else {
        setZoneName(null)
        setError('Invalid zone code')
      }
    } else {
      setZoneName(null)
      setError('')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Form submitted, preventing default behavior')
    setError('')
    setSuccess('')
    setIsLoading(true)
    setIsCheckingAccount(true)
    
    try {
      if (!isLogin) {
        // Signup validation
        if (!formData.zoneCode || formData.zoneCode.length < 6) {
          setError('Please enter a valid zone code')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        // KingsChat ID is required during signup
        if (!formData.kingschatId || formData.kingschatId.trim().length === 0) {
          setError('Please enter your KingsChat ID or click the button to fetch it')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        // Birthday and profile image are optional - can be added later in profile
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }

        // Validate zone code
        const { getZoneByInvitationCode, getZoneRole, isBossCode } = await import('@/config/zones')
        
        // Get zone (Boss code now returns Boss zone)
        const zone = getZoneByInvitationCode(formData.zoneCode)
        if (!zone) {
          setError('Invalid zone code. Please check and try again.')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        // Check if it's boss code
        const isBoss = isBossCode(formData.zoneCode)
        
        // Determine role from code
        const role = getZoneRole(formData.zoneCode)

        setSuccess('Creating your account...')
        
        let profileImageUrl = ''
        
        // Upload profile image if provided
        if (formData.profileImage) {
          setSuccess('Uploading profile picture...')
          try {
            const imageFormData = new FormData()
            imageFormData.append('file', formData.profileImage)
            imageFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'loveworld-singers')
            
            const uploadResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvtjjt3js'}/image/upload`,
              {
                method: 'POST',
                body: imageFormData
              }
            )
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              profileImageUrl = uploadData.secure_url
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError)
            // Continue without image if upload fails
          }
        }
        
        // Sign up with Firebase and create profile in one step
        const profileData: any = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          kingschat_id: formData.kingschatId,
          birthday: formData.birthday || null,
          profile_image: profileImageUrl || null,
          role: isBoss ? 'boss' : 'user', // Set boss role during creation
        }
        
        // Only add administration field if user is Boss (Firebase doesn't allow undefined)
        if (isBoss) {
          profileData.administration = 'Boss'
        }
        
        const result = await FirebaseAuthService.createUserWithEmailAndPassword(
          formData.email,
          formData.password,
          profileData
        )
        
        if (result.error) {
          setError(sanitizeError(result.error))
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }

        setSuccess('Account created! Setting up your profile...')
        
        // Add user to zone (Boss joins Boss zone, others join their zone)
        if (result.user && zone) {
          setSuccess(`Adding you to ${zone.name}...`)
          
          const { ZoneInvitationService } = await import('@/lib/zone-invitation-service')
          const joinResult = await ZoneInvitationService.joinZoneWithCode(
            result.user.uid,
            formData.zoneCode,
            formData.email,
            `${formData.firstName} ${formData.lastName}`,
            role
          )
          
          if (joinResult.success) {
            setSuccess(`Welcome to ${'zoneName' in joinResult ? joinResult.zoneName : 'your zone'}! Redirecting...`)
          } else {
            setError(sanitizeError(('error' in joinResult ? joinResult.error : 'Failed to join zone') || 'Failed to join zone'))
            setIsLoading(false)
            setIsCheckingAccount(false)
            return
          }
        }
        
        // Go directly to home - Firebase auth listener will handle the rest
        console.log('✅ Account created, redirecting to home...')
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      } else {
        setSuccess('Checking your account...')
        
        // Support special name-based logins (The President, The Director, PST Daba/Bisola/Rita)
        const rawIdentifier = formData.email.trim()
        const key = rawIdentifier.toLowerCase()
        const special = SPECIAL_LOGIN_MAP[key]

        const signInEmail = special ? special.email : formData.email

        // Firebase login (using mapped email if special login)
        const result = await FirebaseAuthService.signInWithEmailAndPassword(
          signInEmail,
          formData.password
        )
        
        if (result.error) {
          setError(sanitizeError(result.error))
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        setSuccess('Login successful! Welcome back!')
        console.log('Sign in successful:', result)

        // Set flag to prevent AuthCheck from redirecting too early
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('justLoggedIn', 'true')
        }

        // Redirect after showing success message
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('justLoggedIn')
          }
          router.push('/home')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(sanitizeError(error.message || 'An error occurred during authentication'))
      setIsLoading(false)
      setIsCheckingAccount(false)
    } finally {
      if (isLogin) {
      setIsLoading(false)
        setIsCheckingAccount(false)
      }
    }
  }

  const handleAccountSelection = (selectedProfile: any) => {
    // Store selected account and show password prompt
    setSelectedAccount(selectedProfile)
    setShowAccountSelector(false)
    setShowPasswordPrompt(true)
    setAccountPassword('')
    setError('')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsCheckingAccount(true)
    setError('')
    
    try {
      const { FirebaseAuthService } = await import('@/lib/firebase-auth')
      
      const signInEmail = selectedAccount.email
      console.log('🔐 Signing in with password for:', signInEmail)
      
      // Sign in with their entered password
      const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
        signInEmail,
        accountPassword
      )
      
      if (signInResult.error) {
        setError('Incorrect password. Please try again.')
        setIsLoading(false)
        setIsCheckingAccount(false)
        return
      }
      
      console.log('✅ Password sign-in successful - redirecting to home')
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userAuthenticated', 'true')
        localStorage.setItem('hasCompletedProfile', 'true')
        localStorage.setItem('authProvider', 'kingschat')
      }
      
      setShowPasswordPrompt(false)
      setIsLoading(false)
      setIsCheckingAccount(false)
      
      router.push('/home')
    } catch (error: any) {
      console.error('Account selection error:', error)
      setError(sanitizeError('Failed to sign in with selected account. Please use email/password login.'))
      setIsLoading(false)
      setIsCheckingAccount(false)
      setShowAccountSelector(true) // Show modal again
    }
  }

  const handleFetchKingsChatId = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsFetchingKingsChat(true)
    setError('')
    
    try {
      // Initiate KingsChat OAuth flow
      const authTokens = await KingsChatAuthService.login()
      
      if (!authTokens) {
        setError('KingsChat login was cancelled. Please try again.')
        setIsFetchingKingsChat(false)
        return
      }
      
      // Extract KingsChat UID from token
      const { jwtDecode } = await import('jwt-decode')
      const decoded: any = jwtDecode(authTokens.accessToken)
      const kingschatUserId = decoded.userId || decoded.sub || decoded.id
      
      if (!kingschatUserId) {
        setError('Could not extract user ID from KingsChat')
        setIsFetchingKingsChat(false)
        return
      }
      
      console.log('🔐 KingsChat ID fetched:', kingschatUserId)
      
      // Set the KingsChat ID in the form
      setFormData(prev => ({
        ...prev,
        kingschatId: kingschatUserId
      }))
      
      setSuccess('KingsChat ID fetched successfully!')
      setTimeout(() => setSuccess(''), 2000)
      
    } catch (error: any) {
      console.error('KingsChat fetch error:', error)
      setError(sanitizeError(error.message || 'Failed to fetch KingsChat ID'))
    } finally {
      setIsFetchingKingsChat(false)
    }
  }

  const handleSocialLogin = async (provider: string, e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setError('')
    setSuccess('')
    setIsLoading(true)
    setIsCheckingAccount(true)
    
    try {
      if (provider === 'kingschat') {
        setSuccess('Opening KingsChat login...')
        
        // Initiate KingsChat OAuth flow
        const authTokens = await KingsChatAuthService.login()
        
        if (!authTokens) {
          setError('KingsChat login was cancelled or failed. Please try again.')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        setSuccess('KingsChat login successful! Setting up your account...')
        
        // Extract KingsChat data from token
        const { jwtDecode } = await import('jwt-decode')
        const decoded: any = jwtDecode(authTokens.accessToken)
        const kingschatUserId = decoded.userId || decoded.sub || decoded.id
        const kingschatEmail = decoded.email || decoded.emailAddress
        
        if (!kingschatUserId) {
          setError('Could not extract user ID from KingsChat token')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        console.log('🔐 KingsChat UID:', kingschatUserId)
        console.log('📧 KingsChat Email:', kingschatEmail)
        
        // Check for existing profiles with this KingsChat ID
        const { FirebaseAuthService } = await import('@/lib/firebase-auth')
        const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
        
        console.log('🔍 Checking for existing profiles with KingsChat ID:', kingschatUserId)
        const existingProfiles = await FirebaseDatabaseService.getCollectionWhere(
          'profiles',
          'kingschat_id',
          '==',
          kingschatUserId
        )
        
        // If multiple accounts found, show account selector modal
        if (existingProfiles && existingProfiles.length > 1) {
          console.log('⚠️ Multiple accounts found:', existingProfiles.length)
          setMultipleAccounts(existingProfiles)
          setPendingKingschatId(kingschatUserId)
          setShowAccountSelector(true)
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        // If exactly one account found, prompt for password
        if (existingProfiles && existingProfiles.length === 1) {
          const existingProfile = existingProfiles[0] as any
          console.log('✅ Found existing profile:', existingProfile.email || existingProfile.id)
          
          // Show password prompt for this account
          setSelectedAccount(existingProfile)
          setShowPasswordPrompt(true)
          setAccountPassword('')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        // No existing profile - this is a new user, send to signup form
        console.log('🆕 No existing profile found - redirecting to signup form')
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('kingschatUserId', kingschatUserId)
          localStorage.setItem('kingschatAuthPending', 'true')
        }
        
        setIsLoading(false)
        setIsCheckingAccount(false)
        setIsLogin(false) // Switch to signup mode
        setSuccess('Please complete signup with your KingsChat account')
        
        // Pre-fill KingsChat ID in the form
        setFormData(prev => ({
          ...prev,
          kingschatId: kingschatUserId
        }))
        
        return
        
        return
      }
    } catch (error: any) {
      console.error('Social login error:', error)
      setError(sanitizeError(error.message || 'An error occurred during social login'))
      setIsLoading(false)
      setIsCheckingAccount(false)
    } finally {
      if (provider === 'google') {
        setIsLoading(false)
        setIsCheckingAccount(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile image must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }))
      setError('') // Clear any previous errors
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      if (!forgotPasswordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
        setError('Please enter a valid email address')
        return
      }
      const res = await FirebaseAuthService.resetPassword(forgotPasswordEmail)
      if (res.error) {
        setError(sanitizeError(res.error))
        return
      }
      setForgotPasswordSuccess(true)
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError(sanitizeError(error.message || 'Failed to send reset email'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Dark Header Section */}
      <div className="bg-gray-900 px-8 py-12 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"></div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 text-center pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Join LoveWorld Singers
          </h1>
          <h1 className="text-2xl font-bold text-white mb-4">
            Rehearsal Hub
          </h1>
          <p className="text-gray-300 text-sm">
            Connect with fellow singers and access rehearsal resources
          </p>
        </div>
      </div>

      {/* White Form Section */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-20 px-8 py-8 min-h-[70vh]">
        {/* App Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Loveworld Singers Rehearsal Hub" 
              className="object-contain"
              style={{ width: '60px', height: '60px' }}
            />
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto w-full">
          {/* Zone Detection Banner */}
          {!isLogin && zoneName && (
            <div className="mb-6 p-4 rounded-xl border-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Zone Detected
                  </p>
                  <p className="text-base font-bold text-green-700">
                    {zoneName}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  {/* Zone Code Input - First Field */}
                  <div>
                    <input
                      type="text"
                      name="zoneCode"
                      placeholder="Zone Code (Required)"
                      value={formData.zoneCode}
                      onChange={(e) => handleZoneCodeChange(e.target.value.toUpperCase())}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm font-mono uppercase"
                      required
                      maxLength={10}
                    />
                    {zoneName && (
                      <p className="text-xs text-green-600 mt-1 ml-1">✓ {zoneName}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                      required
                    />
                  </div>
                  
                  {/* KingsChat ID Field with Fetch Button */}
                  <div className="relative">
                    {formData.kingschatId ? (
                      // Show verified badge when KingsChat ID is fetched
                      <div className="w-full px-4 py-4 bg-green-50 border-2 border-green-500 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-green-800 font-semibold text-sm">KingsChat Verified</p>
                            <p className="text-green-600 text-xs">Your account is linked</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, kingschatId: '' }))}
                          className="text-green-700 hover:text-green-900 text-xs underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="kingschatId"
                          placeholder="KingsChat ID (Required)"
                          value={formData.kingschatId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-24"
                          required
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={handleFetchKingsChatId}
                          disabled={isFetchingKingsChat}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isFetchingKingsChat ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Fetch</span>
                            </>
                          ) : (
                            <>
                              <img 
                                src="/kingschat.jpeg" 
                                alt="KC" 
                                className="w-3 h-3 rounded-full object-cover"
                              />
                              <span>Fetch</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
              
              <input
                type="text"
                name="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                required
                pattern=".*"
                title="Enter your email or username"
              />
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link - Only show for login */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl touch-target hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading && isLogin ? 'Signing In...' : isLoading && !isLogin ? 'Creating Account...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Only show KingsChat login button for login mode */}
          {isLogin && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={(e) => handleSocialLogin('kingschat', e)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && isCheckingAccount ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                  <img 
                    src="/kingschat.jpeg" 
                    alt="KingsChat" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  )}
                  {isLoading && isCheckingAccount ? 'Connecting...' : 'Continue with KingsChat'}
                </button>
              </div>
            </>
          )}

          {/* Toggle between Login and Signup */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
              }}
              className="text-gray-600 text-sm focus:outline-none focus:ring-0 focus:border-0 border-0 outline-none"
            >
              {isLogin ? "Don't Have Account? " : "Already have an account? "}
              <span className="text-purple-600 font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {forgotPasswordSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordSuccess(false)
                    setForgotPasswordEmail('')
                  }}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                      setError('')
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Selector Modal */}
      {showAccountSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Select Your Account</h3>
              <p className="text-purple-100 text-sm">
                Multiple accounts found with this KingsChat ID. Choose which one to sign in to:
              </p>
            </div>

            {/* Account List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {multipleAccounts.map((account: any, index: number) => (
                  <button
                    key={account.id || index}
                    onClick={() => handleAccountSelection(account)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {(account.first_name?.[0] || account.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {account.first_name && account.last_name 
                            ? `${account.first_name} ${account.last_name}`
                            : account.email || 'User'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {account.email || 'No email'}
                        </p>
                        {account.zone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Zone: {account.zone}
                          </p>
                        )}
                      </div>
                      <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAccountSelector(false)
                  setMultipleAccounts([])
                  setPendingKingschatId('')
                }}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && selectedAccount && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Enter Password</h3>
              <p className="text-purple-100 text-sm">
                Sign in to: {selectedAccount.first_name && selectedAccount.last_name 
                  ? `${selectedAccount.first_name} ${selectedAccount.last_name}`
                  : selectedAccount.email}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the password you used when creating this account
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false)
                    setShowAccountSelector(true)
                    setAccountPassword('')
                    setError('')
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !accountPassword}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AuthPage() {
  return (
    <AuthCheck>
      <AuthPageContent />
    </AuthCheck>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, User, Users, Calendar, CheckCircle, Award, Edit, Camera, X, Loader2, AlertTriangle, Trash2, ChevronDown, MapPin, Phone, Mail, Shield, Briefcase, Music } from 'lucide-react'

import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { handleAppRefresh } from '@/utils/refresh-utils'
import { ultraFastUploadProfileImage, ultraFastDeleteImage } from '@/utils/ultraFastImageUpload'
import { validateImageFile } from '@/utils/imageUpload'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { KingsChatAuthService } from '@/lib/kingschat-auth'
import { AccountLinkingService } from '@/lib/account-linking'
import { isZoneLeader } from '@/lib/user-role-utils'

// Helper function to adjust color brightness for gradient
const adjustColor = (color: string, amount: number) => {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function ProfilePage() {
  const router = useRouter()
  const { user, signOut, profile: currentProfile, refreshProfile, isLoading } = useAuth()
  const { userZones, currentZone, isSuperAdmin, isZoneCoordinator } = useZone()
  
  // No auth check - Zustand auth store is the single source of truth
  // If no user, show login prompt inline
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
    gender: '',
    birthday: '',
    region: '',
    zone: '',
    church: '',
    designation: '',
    administration: ''
  })

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ stage: '', progress: 0, message: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveProgress, setSaveProgress] = useState(0)
  const [saveStage, setSaveStage] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLinkingKingsChat, setIsLinkingKingsChat] = useState(false)
  const [kingsChatLinked, setKingsChatLinked] = useState(false)
  const [linkingMessage, setLinkingMessage] = useState('')
  const [isCoordinator, setIsCoordinator] = useState(false)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    account: false,
    personal: false,
    location: false,
    ministry: false,
    contact: false,
    attendance: false
  })

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Refresh profile data when component mounts
  useEffect(() => {
    if (user?.uid && !currentProfile) {
      console.log('🔄 Refreshing profile data...')
      refreshProfile()
    }
  }, [user?.uid, currentProfile, refreshProfile])

  // Check if KingsChat is linked on mount
  useEffect(() => {
    const checkKingsChatLink = async () => {
      if (user?.uid) {
        const isLinked = await AccountLinkingService.isKingsChatLinked(user.uid)
        setKingsChatLinked(isLinked)
      }
    }
    checkKingsChatLink()
  }, [user?.uid])

  // Check coordinator status directly from database
  useEffect(() => {
    async function checkRole() {
      if (user?.uid) {
        const { isUserCoordinator } = await import('@/lib/check-coordinator')
        const result = await isUserCoordinator(user.uid)
        setIsCoordinator(result)
      }
    }
    checkRole()
  }, [user?.uid])

  // Use profile data from auth, or empty defaults while loading
  const profileData: any = currentProfile || {
    id: user?.uid || '',
    first_name: '',
    last_name: '',
    email: user?.email || '',
    profile_completed: false
  }

  // ✅ SECURITY: Ensure user can only see their own profile
  useEffect(() => {
    if (user && currentProfile) {
      if (currentProfile.id !== user.uid) {
        console.error('🚨 CRITICAL SECURITY: Profile ID mismatch!')
        refreshProfile()
      }
      if ((currentProfile as any).isPresident === true) {
        const isSpecialUser = typeof window !== 'undefined' && localStorage.getItem('specialUser') === 'true'
        if (!isSpecialUser) {
          router.push('/home')
        }
      }
    }
  }, [user, currentProfile, router, refreshProfile])

  // Initialize edit form with profile data when profile loads
  useEffect(() => {
    if (currentProfile) {
      setEditForm({
        firstName: currentProfile.first_name || '',
        lastName: currentProfile.last_name || '',
        middleName: (currentProfile as any).middle_name || '',
        phoneNumber: (currentProfile as any).phone_number || '',
        gender: (currentProfile as any).gender || '',
        birthday: (currentProfile as any).birthday || '',
        region: (currentProfile as any).region || '',
        zone: (currentProfile as any).zone || '',
        church: (currentProfile as any).church || '',
        designation: (currentProfile as any).designation || '',
        administration: (currentProfile as any).administration || ''
      })
      if ((currentProfile as any).profile_image_url) {
        setProfileImage((currentProfile as any).profile_image_url)
      }
    }
  }, [currentProfile])

  // Don't show anything if no user - prevents flash (MUST be after all hooks)
  if (!user && !currentProfile) {
    return null
  }
  
  // Helper function for input styling with zone colors
  const getInputClassName = () => {
    return "w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
  }

  const getInputStyle = () => ({
    '--tw-ring-color': currentZone?.themeColor || '#9333ea',
  } as React.CSSProperties)

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = currentZone?.themeColor || '#9333ea'
    e.target.style.boxShadow = `0 0 0 2px ${currentZone?.themeColor || '#9333ea'}33`
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db'
    e.target.style.boxShadow = 'none'
  }

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Profile completion logic
  const isProfileComplete = currentProfile?.profile_completed || false
  
  // Simple profile update function
  const updateProfile = async (updates: any) => {
    try {
      console.log('🔍 Getting authenticated user...')
      // Use Firebase Auth instead of Supabase
      const { getAuth } = await import('firebase/auth')
      const { initializeApp } = await import('firebase/app')
      
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      }

      const app = initializeApp(firebaseConfig)
      const auth = getAuth(app)
      const firebaseUser = auth.currentUser
      
      // Firebase auth doesn't have authError like Supabase
      // Authentication is handled by FirebaseAuthService
      // Use cached profile if user is still loading
      const currentUser = firebaseUser || (currentProfile?.id ? { uid: currentProfile.id } : null)
      
      if (!currentUser) {
        console.error('❌ No authenticated user found')
        throw new Error('No authenticated user')
      }

      console.log('👤 User ID:', currentUser.uid)
      console.log('📝 Update data:', updates)

      // Test authentication and profile access before update using Firebase
      const testData = await FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
      
      if (!testData) {
        console.error('❌ Profile access test failed: Profile not found')
        throw new Error('Cannot access profile: Profile not found')
      }

      console.log('✅ Profile access test passed:', testData)

      const result = await FirebaseDatabaseService.updateDocument('profiles', currentUser.uid, updates)

      if (!result) {
        console.error('❌ Database update error: Update failed')
        throw new Error('Database update failed: Update operation failed')
      }

      console.log('✅ Update successful:', result)
      
      // Refresh profile data
      await refreshProfile()
      return true
    } catch (error) {
      console.error('❌ Profile update error:', error)
      return false
    }
  }


  
  
  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }



  // Handle image upload with instant preview
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    if (!user?.uid) {
      alert('User not authenticated')
      return
    }

    // INSTANT PREVIEW - Show image immediately before upload
    const previewUrl = URL.createObjectURL(file)
    setProfileImage(previewUrl)
    setIsUploadingImage(true)

    try {
      // Upload in background without blocking UI
      const result = await ultraFastUploadProfileImage(file, user.uid, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success && result.url) {
        // Update profile with new image URL in background
        await updateProfile({
          profile_image_url: result.url
        })

        // Replace preview with actual URL
        URL.revokeObjectURL(previewUrl)
        setProfileImage(result.url)
      } else {
        // Revert to previous image on failure
        URL.revokeObjectURL(previewUrl)
        setProfileImage(profileData.profile_image_url || null)
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      // Revert to previous image on error
      URL.revokeObjectURL(previewUrl)
      setProfileImage(profileData.profile_image_url || null)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingImage(false)
      setUploadProgress({ stage: '', progress: 0, message: '' })
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    console.log('🚀 Starting profile save process...')
    setIsSaving(true)
    setSaveProgress(0)
    setSaveStage('Validating...')
    setSaveMessage('')
    
    try {
      console.log('🚀 Starting profile save...')
      console.log('📝 Edit form data:', editForm)
      console.log('🖼️ Profile image:', profileImage)
      console.log('👤 Current user:', user?.uid)
      
      // Basic validation
      setSaveProgress(10)
      setSaveStage('Validating form data...')
      
      if (!editForm.firstName.trim()) {
        setSaveMessage('❌ First name is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.lastName.trim()) {
        setSaveMessage('❌ Last name is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.phoneNumber.trim()) {
        setSaveMessage('❌ Phone number is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.region.trim()) {
        setSaveMessage('❌ Region is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.church.trim()) {
        setSaveMessage('❌ Church is required')
        setIsSaving(false)
        return
      }
      
      const updateData: any = {
        first_name: editForm.firstName.trim(),
        last_name: editForm.lastName.trim(),
        phone_number: editForm.phoneNumber.trim(),
        region: editForm.region.trim(),
        church: editForm.church.trim(),
      }
      
      // Only add optional fields if they have values (Firebase doesn't allow undefined)
      if (editForm.middleName.trim()) updateData.middle_name = editForm.middleName.trim()
      if (editForm.gender) updateData.gender = editForm.gender as 'Male' | 'Female'
      if (editForm.birthday) updateData.birthday = editForm.birthday
      if (editForm.zone.trim()) updateData.zone = editForm.zone.trim()
      if (editForm.designation) updateData.designation = editForm.designation as 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer'
      if (editForm.administration) updateData.administration = editForm.administration as 'Coordinator' | 'Assistant Coordinator' | 'Admin' | 'Treasurer' | 'Member'
      
      console.log('📤 Sending update data:', updateData)
      
      // Test database connection first
      setSaveProgress(20)
      setSaveStage('Connecting to database...')
      console.log('🔍 Testing database connection...')
      
      try {
        if (!user?.uid) {
          throw new Error('User not authenticated')
        }
        const testData = await FirebaseDatabaseService.getDocument('profiles', user.uid)
        console.log('✅ Database connection successful:', testData)
      } catch (testError) {
        console.error('❌ Database connection failed:', testError)
        setSaveMessage(`❌ Database connection failed: ${(testError as Error).message}`)
        setIsSaving(false)
        return
      }
      
      // Update profile using the ultra-fast hook
      setSaveProgress(40)
      setSaveStage('Updating profile...')
      const profileSuccess = await updateProfile(updateData)
      
      console.log('✅ Profile update result:', profileSuccess)

      if (profileSuccess) {
        setSaveProgress(100)
        setSaveStage('Complete!')
        setSaveMessage('✅ Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => {
          setSaveMessage('')
          setSaveProgress(0)
          setSaveStage('')
        }, 3000)
        

      } else {
        setSaveProgress(80)
        setSaveStage('Profile save failed')
        setSaveMessage('❌ Failed to update profile. Check console for details.')
        setTimeout(() => {
          setSaveMessage('')
          setSaveProgress(0)
          setSaveStage('')
        }, 3000)
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setSaveMessage(`❌ Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => {
        setSaveMessage('')
        setSaveProgress(0)
        setSaveStage('')
      }, 3000)
    } finally {
      setIsSaving(false)
      console.log('✅ Profile save process completed - resetting saving state')
    }
  }

  // Removed QR code functionality


  const handleLogout = async () => {
    await signOut()
    // Don't use router.push - signOut already handles redirect
  }

  // Link KingsChat account
  const handleLinkKingsChat = async () => {
    if (!user?.uid) return
    
    setIsLinkingKingsChat(true)
    setLinkingMessage('')
    
    try {
      // Initiate KingsChat OAuth flow
      const authTokens = await KingsChatAuthService.login()
      
      if (!authTokens) {
        setLinkingMessage('KingsChat login was cancelled')
        setIsLinkingKingsChat(false)
        return
      }
      
      // Link KingsChat to current Firebase account
      const result = await AccountLinkingService.linkKingsChatToFirebase(
        user.uid,
        authTokens.accessToken
      )
      
      if (result.success) {
        setKingsChatLinked(true)
        setLinkingMessage('✅ KingsChat account linked successfully!')
        await refreshProfile() // Refresh profile to show updated data
      } else {
        setLinkingMessage(`❌ ${result.error}`)
      }
    } catch (error: any) {
      console.error('Failed to link KingsChat:', error)
      setLinkingMessage(`❌ ${error.message || 'Failed to link KingsChat account'}`)
    } finally {
      setIsLinkingKingsChat(false)
    }
  }

  // Unlink KingsChat account
  const handleUnlinkKingsChat = async () => {
    if (!user?.uid) return
    
    const confirmed = window.confirm('Are you sure you want to unlink your KingsChat account? You can always link it again later.')
    if (!confirmed) return
    
    setIsLinkingKingsChat(true)
    setLinkingMessage('')
    
    try {
      const result = await AccountLinkingService.unlinkKingsChatFromFirebase(user.uid)
      
      if (result.success) {
        setKingsChatLinked(false)
        setLinkingMessage('✅ KingsChat account unlinked successfully')
        await refreshProfile()
      } else {
        setLinkingMessage(`❌ ${result.error}`)
      }
    } catch (error: any) {
      console.error('Failed to unlink KingsChat:', error)
      setLinkingMessage(`❌ ${error.message || 'Failed to unlink KingsChat account'}`)
    } finally {
      setIsLinkingKingsChat(false)
    }
  }

  // Delete account function
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion')
      return
    }

    setIsDeleting(true)
    try {
      console.log('🗑️ Deleting user account...')
      
      // Delete user profile from Firebase
      await FirebaseDatabaseService.deleteDocument('profiles', user?.uid || '')
      
      // Delete user from Firebase Auth
      const result = await FirebaseAuthService.deleteUser()
      if (!result.success) {
        throw new Error(result.error)
      }
      
      console.log('✅ Account deleted successfully')
      
      // Sign out and redirect to auth page
    await signOut()
    router.push('/auth')
      
    } catch (error) {
      console.error('❌ Account deletion error:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  // No redirect - allow access with demo data
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push('/auth')
  //   }
  // }, [isLoading, user, router])

  // Only show loading if auth is loading AND no cached profile
  if (isLoading && !currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Allow access even without user - show president's demo data
  // if (!isLoading && !user) {
  //   return null
  // }

  // Real user data from profile (use currentProfile for immediate loading)
  const userProfile = {
    // Personal Information
    firstName: profileData.first_name || '',
    middleName: profileData.middle_name || '',
    lastName: profileData.last_name || '',
    fullName: `${profileData.first_name || ''} ${profileData.middle_name || ''} ${profileData.last_name || ''}`.trim(),
    // Show "KingsChat" for KingsChat users, otherwise show email
    email: (profileData as any).kingschatUserId 
      ? 'KingsChat' 
      : (profileData.email || ''),
    phoneNumber: profileData.phone_number || '',
    gender: profileData.gender || '',
    birthday: profileData.birthday || '',
    
    // Location Information
    region: profileData.region || '',
    zone: profileData.zone || '',
    church: profileData.church || '',
    
    // Ministry Information
    designation: profileData.designation || '',
    administration: profileData.administration || '',
    socialProvider: (profileData as any).kingschatUserId ? 'kingschat' : (profileData.social_provider || 'email'),
    socialId: (profileData as any).kingschatUserId || profileData.social_id || profileData.email || '',
    
    // Additional Profile Data (these would come from other tables in a real app)
    groups: ["Zone Member"], // Default zone member
    joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
    totalRehearsals: 0,
    attendanceRate: 0,
    lastCheckIn: "Never"
  }


  // QR code functionality removed

  // Mock attendance data for now
  const attendanceHistory: any[] = []
  const attendanceStats = { total: 0, present: 0, late: 0, absent: 0, rate: 0 }




  // Check if user is boss
  const isBossUser = currentProfile?.role === 'boss' || currentProfile?.email?.toLowerCase().startsWith('boss')
  
  const menuItems = getMenuItems(handleLogout, handleAppRefresh, isCoordinator, isBossUser)

  const rightButtons = null

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Main Content with Apple-style reveal effect */}
      <div 
        className={`
          h-full flex flex-col overflow-x-hidden
          transition-all duration-300 ease-out
          ${isMenuOpen 
            ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' 
            : 'translate-x-0 scale-100 rounded-none'
          }
        `}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
      {/* Animated Header */}
      <ScreenHeader 
        title="Profile" 
        showMenuButton={false}
        rightButtons={rightButtons}
        rightImageSrc="/logo.png"
        leftButtons={
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />



      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
      
      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="mx-4 mt-4 mb-2">
          <div 
            className="bg-white border-l-4 rounded-lg shadow-sm p-4"
            style={{ borderLeftColor: currentZone?.themeColor || '#9333ea' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${currentZone?.themeColor || '#9333ea'}20` }}
              >
                <Edit className="w-5 h-5" style={{ color: currentZone?.themeColor || '#9333ea' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Edit Mode Active</h3>
                <p className="text-sm text-gray-600">Make changes to your profile information below</p>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                ></div>
                <span className="text-sm font-medium" style={{ color: currentZone?.themeColor || '#9333ea' }}>
                  Editing
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Header - Modern TikTok Style with Zone Colors */}
      <div 
        className="relative px-4 pt-6 pb-8 overflow-hidden"
        style={{
          background: currentZone?.themeColor
            ? `linear-gradient(135deg, ${currentZone.themeColor} 0%, ${adjustColor(currentZone.themeColor, -20)} 50%, ${adjustColor(currentZone.themeColor, 20)} 100%)`
            : 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #3b82f6 100%)'
        }}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white rounded-full -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-white rounded-full translate-y-12 sm:translate-y-18 lg:translate-y-24 -translate-x-12 sm:-translate-x-18 lg:-translate-x-24"></div>
        </div>

        <div className="relative text-center">
          {/* Profile Image with Glow Effect */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 scale-110"></div>
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-white/30 shadow-2xl">
              {profileImage ? (
                <>
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this profile image?')) {
                          try {
                            const success = await ultraFastDeleteImage(profileImage)
                            if (success) {
                              setProfileImage(null)
                              await updateProfile({ profile_image_url: undefined })
                              alert('Profile image deleted successfully!')
                            } else {
                              alert('Failed to delete image. Please try again.')
                            }
                          } catch (error) {
                            console.error('Error deleting image:', error)
                            alert('Error deleting image. Please try again.')
                          }
                        }
                      }}
                      className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                      title="Delete image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
              <User 
                className="w-14 h-14"
                style={{ color: currentZone?.themeColor || '#9333ea' }}
              />
              )}
            </div>

            {/* Edit Button with Animation */}
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                setSaveMessage('')
              }}
              className="absolute bottom-0 right-0 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/50"
              style={{ color: currentZone?.themeColor || '#9333ea' }}
              aria-label="Edit Profile"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {userProfile.fullName || 'User'}
          </h2>
          <p className="text-sm text-white/90 mb-4 drop-shadow">{userProfile.email || 'user@example.com'}</p>

          {/* Badges - Horizontal Scroll */}
          <div className="flex items-center justify-center gap-2 flex-wrap px-4">
            {userProfile.designation && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
                {userProfile.designation}
            </span>
            )}
            {userProfile.administration && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
                {userProfile.administration}
            </span>
            )}
            <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
              Zone Member
            </span>
          </div>
        </div>
      </div>

      {/* Account Information - Collapsible */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('account')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Account</h3>
                <p className="text-[10px] text-gray-500">Login & security</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.account ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.account ? 'max-h-[600px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1 space-y-3">
              {/* Primary Account - Only show for non-KingsChat users */}
              {userProfile.socialProvider !== 'kingschat' && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  userProfile.socialProvider === 'google' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {userProfile.socialProvider === 'google' ? (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    </svg>
                  ) : (
                    <Mail className="w-4 h-4 text-white" />
                  )}
                </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">
                    {userProfile.socialProvider === 'google' ? 'Google Account' : 'Email Account'}
                  </p>
                      <p className="text-[10px] text-gray-600 truncate">{userProfile.socialId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show status for users who registered with KingsChat */}
              {userProfile.socialProvider === 'kingschat' && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/kingschat.jpeg" 
                      alt="KingsChat" 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">KingsChat Account</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        Primary authentication method
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      {/* My Zones Section */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">My Zones</h3>
                  <p className="text-[10px] text-gray-500">
                    {isSuperAdmin ? 'Super Admin - All Zones' : `${userZones.length} zone${userZones.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Join Zone Button */}
                <Link
                  href="/pages/join-zone"
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  Join Zone
                </Link>
              </div>
            </div>

            {/* Current Zone */}
            {currentZone && (
              <div className="mb-3 p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: currentZone.themeColor }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{currentZone.name}</p>
                    <p className="text-[10px] text-gray-600">{currentZone.region}</p>
                  </div>
                  <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">
                    Current
                  </span>
                </div>
              </div>
            )}

            {/* Other Zones */}
            {userZones.length > 1 && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  Other Zones ({userZones.length - 1})
                </p>
                {userZones
                  .filter(zone => zone.id !== currentZone?.id)
                  .slice(0, 3)
                  .map(zone => (
                    <div key={zone.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: zone.themeColor }}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{zone.name}</p>
                          <p className="text-[10px] text-gray-500">{zone.region}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                {userZones.length > 4 && (
                  <p className="text-[10px] text-gray-500 text-center py-1">
                    +{userZones.length - 4} more zones
                  </p>
                )}
              </div>
            )}

            {/* No Zones Message */}
            {userZones.length === 0 && (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-3">You haven't joined any zones yet</p>
                <Link
                  href="/pages/join-zone"
                  className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Your First Zone
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
          </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                <p className="text-[10px] text-gray-500">
                  {isEditing ? '✏️ Editing mode' : 'Name, contact & details'}
                </p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.personal ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.personal ? 'max-h-[2000px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
            {isEditing ? (
              <>
                {/* Profile Image Upload */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold mb-2 block">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 font-medium"
                        style={{ backgroundColor: currentZone?.themeColor || '#9333ea' }}
                        onMouseEnter={(e) => {
                          if (!isUploadingImage) {
                            e.currentTarget.style.backgroundColor = adjustColor(currentZone?.themeColor || '#9333ea', -20)
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isUploadingImage) {
                            e.currentTarget.style.backgroundColor = currentZone?.themeColor || '#9333ea'
                          }
                        }}
                      >
                        <Camera className="w-4 h-4" />
                        {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Max 10MB • JPG, PNG, or WebP</p>
                      
                      {/* Upload Progress */}
                      {isUploadingImage && uploadProgress.stage && (
                        <div className="mt-2 w-full">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>{uploadProgress.message}</span>
                            <span>{uploadProgress.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ 
                                width: `${uploadProgress.progress}%`,
                                backgroundColor: currentZone?.themeColor || '#9333ea'
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700 font-bold">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={getInputClassName()}
                      style={getInputStyle()}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Enter first name"
                    />
                  </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Middle Name</label>
                        <input
                          type="text"
                          value={editForm.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter middle name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Gender</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select gender</option>
                          <option value="Male" className="text-sm italic">Male</option>
                          <option value="Female" className="text-sm italic">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Birthday</label>
                        <input
                          type="date"
                          value={editForm.birthday}
                          onChange={(e) => handleInputChange('birthday', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Location Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-700 font-bold">Region</label>
                      <input
                        type="text"
                        value={editForm.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter region"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Church</label>
                      <input
                        type="text"
                        value={editForm.church}
                        onChange={(e) => handleInputChange('church', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter church"
                      />
                    </div>
                  </div>
                </div>

                {/* Designation Information Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Designation Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Designation</label>
                        <select
                          value={editForm.designation}
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select designation</option>
                          <option value="Soprano" className="text-sm italic">Soprano</option>
                          <option value="Alto" className="text-sm italic">Alto</option>
                          <option value="Tenor" className="text-sm italic">Tenor</option>
                          <option value="Bass" className="text-sm italic">Bass</option>
                          <option value="Instrumentalist" className="text-sm italic">Instrumentalist</option>
                          <option value="Backup Singer" className="text-sm italic">Backup Singer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Administration</label>
                        <select
                          value={editForm.administration}
                          onChange={(e) => handleInputChange('administration', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select administration</option>
                          <option value="Coordinator" className="text-sm italic">Coordinator</option>
                          <option value="Assistant Coordinator" className="text-sm italic">Assistant Coordinator</option>
                          <option value="Admin" className="text-sm italic">Admin</option>
                          <option value="Treasurer" className="text-sm italic">Treasurer</option>
                          <option value="Member" className="text-sm italic">Member</option>
                        </select>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Save Progress & Message */}
                {(isSaving || saveMessage) && (
                  <div className="p-4 rounded-lg border bg-white shadow-sm">
                    {isSaving ? (
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${saveProgress}%` }}
                          />
                        </div>
                        
                        {/* Progress Text */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {saveStage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {saveProgress}%
                          </span>
                        </div>
                        
                        {/* Loading Animation */}
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Saving your changes...</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-lg text-sm font-medium ${
                        saveMessage.includes('✅')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {saveMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    style={{ 
                      backgroundColor: currentZone?.themeColor || '#9333ea'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = adjustColor(currentZone?.themeColor || '#9333ea', -20)
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.currentTarget.style.backgroundColor = currentZone?.themeColor || '#9333ea'
                      }
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSaveMessage('')
                      setSaveProgress(0)
                      setSaveStage('')
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode - Modern Cards */}
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">First Name</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.firstName || 'Not set'}</p>
              </div>
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Middle</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.middleName || 'Not set'}</p>
                      </div>
              </div>
            </div>
            
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Last Name</label>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.lastName || 'Not set'}</p>
            </div>
            
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Gender</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.gender || 'Not set'}</p>
              </div>
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Birthday</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">
                          {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
              </div>
            </div>

                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.phoneNumber || 'Not set'}</p>
                  </div>
            </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('location')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Location</h3>
                <p className="text-[10px] text-gray-500">Region & church</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.location ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.location ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1 space-y-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                <label className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">Region</label>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{userProfile.region || 'Not set'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Church</label>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.church || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('ministry')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Designation</h3>
                <p className="text-[10px] text-gray-500">Role & designation</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.ministry ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.ministry ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1 space-y-2">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                <label className="text-[10px] text-purple-700 font-semibold uppercase tracking-wide">Designation</label>
              <div className="mt-1">
                  <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Music className="w-3 h-3 mr-1" />
                  {userProfile.designation || 'Not specified'}
                </span>
              </div>
            </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                <label className="text-[10px] text-blue-700 font-semibold uppercase tracking-wide">Administration</label>
              <div className="mt-1">
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Award className="w-3 h-3 mr-1" />
                  {userProfile.administration || 'Not specified'}
                </span>
              </div>
            </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                <label className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">Zone Role</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                    <Users className="w-3 h-3 mr-1" />
                    Zone Member
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Check-in - Collapsible */}
      {/* Recent Attendance - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('attendance')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Attendance</h3>
                <p className="text-[10px] text-gray-500">Recent check-ins</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.attendance ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.attendance ? 'max-h-[800px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
          {attendanceHistory.length > 0 ? (
                <div className="space-y-1.5">
            {attendanceHistory.map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                      record.status === 'present' ? 'bg-green-500' : 
                      record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                          <p className="text-xs font-bold text-gray-900">{record.event_name}</p>
                          <p className="text-[10px] text-gray-500">
                        {new Date(record.check_in_time).toLocaleDateString()}
                      </p>
                  </div>
                </div>
                <div className="text-right">
                        <p className={`text-[10px] font-bold ${
                      record.status === 'present' ? 'text-green-600' : 
                      record.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </p>
                        <p className="text-[10px] text-gray-500">
                      {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          ) : (
                <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">No attendance yet</p>
                  <p className="text-[10px] text-gray-500">Use your QR code to check in</p>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Bottom Spacing */}
      <div className="h-6"></div>

      </div> {/* Close Scrollable Content Container */}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
        </div>
      </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete your account and remove all your data from our servers. 
                This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">What will be deleted:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• Your profile information</li>
                  <li>• Your attendance records</li>
                  <li>• Your zone membership</li>
                  <li>• All associated data</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* End Apple-style animated container */}

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  )
}

export default function ProfilePageWithAuth() {
  return <ProfilePage />
}


"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Music, Tag, Users, Menu, ArrowLeft } from "lucide-react";
import { PraiseNightSong, Comment, PraiseNight, Category } from '../../types/supabase';
import { useAdminData } from '../../hooks/useAdminData';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { FirebaseAuthService } from '@/lib/firebase-auth';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
import { logAdminAction } from '@/lib/admin-activity-logger';
import { versionManager } from '@/utils/versionManager';
import { uploadBannerImage } from '@/utils/imageUpload';
import { ToastContainer, Toast } from '../../components/Toast';
import ZoneSwitcher from '@/components/ZoneSwitcher';
import { getRoleTerminology, getFullRoleName, getZoneTheme } from '@/utils/zone-theme';
import { AdminThemeProvider } from '../../components/admin/AdminThemeProvider';

// Import admin components
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminMobileNav from '../../components/admin/AdminMobileNav';
import AdminMobileHeader from '../../components/admin/AdminMobileHeader';
import PagesSection from '../../components/admin/PagesSection';
import CategoriesSection from '../../components/admin/CategoriesSection';
import MediaSection from '../../components/admin/MediaSection';
import MediaUploadSection from '../../components/admin/MediaUploadSection';
import MembersSection from '../../components/admin/MembersSection';
import SimpleNotificationsSection from '../../components/admin/SimpleNotificationsSection';
import AdminModals from '../../components/admin/AdminModals';
import PageCategoriesSection from '../../components/admin/PageCategoriesSection';
import SubmittedSongsPage from '../pages/admin/submitted-songs/page';
import DashboardSection from '../../components/admin/DashboardSection';
import MasterLibrarySection from '../../components/admin/MasterLibrarySection';
import SubGroupsSection from '../../components/admin/SubGroupsSection';
import AnalyticsSection from '../../components/admin/AnalyticsSection';
import CalendarSection from '../../components/admin/CalendarSection';
import { useZoneSubGroups } from '../../hooks/useSubGroup';

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  
  // Zone context - must be called before any conditional returns
  const { currentZone, isZoneCoordinator, isLoading: zoneLoading } = useZone();
  
  // Sub-group management (for Zone Coordinators) - must be called before any conditional returns
  const { pendingCount: pendingSubGroupCount } = useZoneSubGroups();
  
  // Admin authentication state
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; username: string; fullName: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize admin from user profile
  useEffect(() => {
    if (user && profile && currentZone) {
      const roleName = getFullRoleName(currentZone.id, profile.first_name, profile.last_name);
      setCurrentAdmin({
        id: user.uid,
        username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
        fullName: roleName
      });
      setIsAuthenticated(true);
    }
  }, [user, profile, currentZone]);

  // Check if user is HQ Admin
  const isHQAdmin = Boolean(profile?.email && [
    'lliamzelvin@gmail.com',
    'ihenacho23@gmail.com', 
    'ephraimloveworld1@gmail.com',
    'takeshopstores@gmail.com',
    'nnennawealth@gmail.com'
  ].includes(profile.email.toLowerCase()))

  // UI state
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [selectedPage, setSelectedPage] = useState<PraiseNight | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showPageModal, setShowPageModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPageCategoryModal, setShowPageCategoryModal] = useState(false); 
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PraiseNight | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPageCategory, setEditingPageCategory] = useState<any | null>(null); 
  const [editingSong, setEditingSong] = useState<PraiseNightSong | null>(null);

  // Form states
  const [newPageName, setNewPageName] = useState('');
  const [newPageDate, setNewPageDate] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageCategory, setNewPageCategory] = useState<'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive'>('unassigned');
  const [newPagePageCategory, setNewPagePageCategory] = useState(''); 
  const [newPageDays, setNewPageDays] = useState(0);
  const [newPageHours, setNewPageHours] = useState(0);
  const [newPageMinutes, setNewPageMinutes] = useState(0);
  const [newPageSeconds, setNewPageSeconds] = useState(0);
  const [newPageBannerImage, setNewPageBannerImage] = useState('');
  const [newPageBannerFile, setNewPageBannerFile] = useState<File | null>(null);
  const [newPageCategoryName, setNewPageCategoryName] = useState('');
  const [newPageCategoryDescription, setNewPageCategoryDescription] = useState(''); 
  const [newPageCategoryImage, setNewPageCategoryImage] = useState(''); 
  const [selectedPageCategoryFilter, setSelectedPageCategoryFilter] = useState<string | null>(null); 

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PraiseNight | null>(null);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [showDeletePageCategoryDialog, setShowDeletePageCategoryDialog] = useState(false); 
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [pageCategoryToDelete, setPageCategoryToDelete] = useState<any | null>(null); 
  const [showDeleteSongDialog, setShowDeleteSongDialog] = useState(false);
  const [songToDelete, setSongToDelete] = useState<PraiseNightSong | null>(null);

  // Data states
  const [allSongs, setAllSongs] = useState<PraiseNightSong[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [pageCategories, setPageCategories] = useState<any[]>([]); 
  

  // Pagination and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heard' | 'unheard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

 
  const {
    pages: allPraiseNights,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    refreshData,
    setZoneId
  } = useAdminData();

  // Set zone ID when currentZone changes
  useEffect(() => {
    if (currentZone) {
      console.log('🔄 Admin: Setting zone for data loading:', currentZone.id);
      setZoneId(currentZone.id);
    }
  }, [currentZone, setZoneId]);

 
  const [loadingSongs, setLoadingSongs] = useState(false);

 
  useEffect(() => {
    if (selectedPage) {
      setLoadingSongs(true);
     
      getCurrentSongs(selectedPage.id, true).then(songs => {
        console.log(`📊 Loaded ${songs.length} songs for page ${selectedPage.id}`);
        setAllSongs(songs);
        setLoadingSongs(false);
      }).catch(error => {
        console.error('Error loading songs:', error);
        setAllSongs([]);
        setLoadingSongs(false);
      });
    } else {
      setAllSongs([]);
    }
  }, [selectedPage, getCurrentSongs]);

 


  const allAvailableCategories = useMemo(() => {
    if (allSongs.length === 0) return [];
    const songCategoryNames = allSongs.map((song: PraiseNightSong) => song.category);
    // Remove duplicates and return unique category names
    return [...new Set(songCategoryNames)];
  }, [allSongs]);

  
  const allCategories = useMemo(() => {
    // Start with database categories
    const combinedCategories = [...dbCategories];

    // Add song-based categories that don't exist in database
    allAvailableCategories.forEach((categoryName: string) => {
      const existsInDb = dbCategories.some(cat => cat.name === categoryName);
      if (!existsInDb) {
        combinedCategories.push({
          id: `song-cat-${categoryName}`,
          name: categoryName,
          description: '',
          icon: 'Music',
          color: '#3B82F6',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    return combinedCategories;
  }, [dbCategories, allAvailableCategories]);

  // Load categories from database (zone-aware)
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentZone) {
        console.log('⏳ Waiting for zone to load...');
        return;
      }

      try {
        console.log('🌍 Loading categories for zone:', currentZone.id);
        const categories = await ZoneDatabaseService.getCategories(currentZone.id);
        console.log('🔥 Raw categories from zone:', categories);

        // Map categories to include both Firebase ID and Supabase ID
        const mappedCategories = categories.map(category => ({
          ...category,
          firebaseId: category.id, // Firebase document ID (string)
          id: category.id, // Keep Firebase ID as primary ID
          supabaseId: category.id // This will be the Firebase ID for now
        }));

        console.log('🔥 Mapped categories:', mappedCategories);
        setDbCategories(mappedCategories as any);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [currentZone]);

  // Load page categories from database (zone-aware)
  useEffect(() => {
    const loadPageCategories = async () => {
      if (!currentZone) {
        console.log('⏳ Waiting for zone to load...');
        return;
      }

      try {
        console.log('🌍 Loading page categories for zone:', currentZone.id);
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        console.log('🔥 Raw page categories from zone:', categories);
        setPageCategories(categories);
      } catch (error) {
        console.error('Error loading page categories:', error);
      }
    };

    loadPageCategories();
  }, [currentZone]);

  // Check if user is zone coordinator - ONLY on initial load, not on every re-render
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  
  useEffect(() => {
    // Wait for Firebase auth to finish loading first
    if (authLoading) {
      console.log('⏳ Auth still loading...')
      return
    }

    // Don't redirect - just return nothing if no user
    if (!user) {
      console.log('⏳ No user yet, waiting...')
      return
    }

    // Wait for zone context to finish loading before checking permissions
    if (zoneLoading) {
      console.log('⏳ Zone context still loading...')
      return
    }

    // Wait for zone to be available
    if (!currentZone) {
      console.log('⏳ Waiting for zone to load...')
      return
    }

    // Only check auth ONCE on initial load to prevent redirect loops
    if (hasCheckedAuth) {
      return
    }

    // Check if user has admin access (zone coordinator OR HQ admin)
    const isHQAdminCheck = Boolean(profile?.email && [
      'lliamzelvin@gmail.com',
      'ihenacho23@gmail.com', 
      'ephraimloveworld1@gmail.com',
      'takeshopstores@gmail.com',
      'nnennawealth@gmail.com'
    ].includes(profile.email.toLowerCase()))
    
    // Give a small delay to ensure zone role is properly loaded from cache
    const checkAccess = () => {
      if (!isZoneCoordinator && !isHQAdminCheck) {
        console.log('❌ User is not a zone coordinator or HQ admin, redirecting to home')
        router.push('/home')
        return
      }

      // Mark auth as checked so we don't redirect on subsequent re-renders
      setHasCheckedAuth(true)
      
      const role = getRoleTerminology(currentZone.id);
      console.log(`✅ ${role.title} access granted for:`, currentZone.name)
    }

    // Small delay to ensure zone data is fully loaded from cache
    const timer = setTimeout(checkAccess, 500)
    return () => clearTimeout(timer)
  }, [user, isZoneCoordinator, currentZone, zoneLoading, router, hasCheckedAuth, profile?.email, authLoading]);

  // Get pages from Firebase (includes unassigned for admin)
  const pages = useMemo(() => {
    console.log('🔍 Pages useMemo triggered:', { loading, allPraiseNights: allPraiseNights?.length, showPageModal });
    
    if (loading) {
      console.log('⏳ Still loading...');
      return [];
    }
    
    if (!allPraiseNights) {
      console.log('❌ No allPraiseNights data');
      return [];
    }
    
    console.log('📄 Admin pages loaded:', allPraiseNights.length, 'pages');
    console.log('📄 All pages data:', allPraiseNights);
    return allPraiseNights;
  }, [allPraiseNights, loading]);

  // Only show brief loading if absolutely no user data exists
  // This should rarely happen since auth is cached
  if (!profile && !user && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Toast helper functions
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Note: Authentication is now handled by the AdminAuth component
  // But we still need handleAdminLogout for the sidebar
  const handleAdminLogout = () => {
    if (currentAdmin) {
      console.log('🔐 Admin logged out:', currentAdmin.username);
    }

    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');

    addToast({
      type: 'info',
      message: 'You have been successfully logged out.'
    });

    // Force page reload to show login screen
    window.location.reload();
  };

  // Category management functions
  const handleAddCategory = async () => {
    console.log('🎯 handleAddCategory called with name:', newPageCategoryName);

    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a category name'
      });
      return;
    }

    try {
      const newCategory: Omit<Category, 'id'> = {
        name: newPageCategoryName.trim(),
        description: `Category: ${newPageCategoryName.trim()}`,
        icon: 'Tag',
        color: '#8B5CF6',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🌍 Creating category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.createCategory(currentZone.id, newCategory);

      if (result.success) {
        console.log('✅ Category added successfully');
        addToast({
          type: 'success',
          message: 'Category added successfully'
        });

        // Reload categories from database
        const categories = await ZoneDatabaseService.getCategories(currentZone.id);
        setDbCategories(categories as any);

        setNewPageCategoryName('');
        setShowCategoryModal(false);
        refreshData(); // Refresh all data to ensure UI is updated

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.createCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, newCategory.name);
        }
      } else {
        throw new Error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('❌ Error adding category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add category'
      });
    }
  };

  const handleEditCategory = (categoryName: string) => {
    const category = allCategories.find(c => c.name === categoryName);
    if (category) {
      // Check if this is a real database category or a song-based category
      const isDbCategory = dbCategories.some(dbCat => dbCat.id === category.id);

      if (!isDbCategory) {
        // This is a song-based category that doesn't exist in the database yet
        addToast({
          type: 'error',
          message: 'This category only exists in songs. Please create it in the database first to edit it.'
        });
        return;
      }

      setEditingCategory(category);
      setNewPageCategoryName(category.name);
      setShowCategoryModal(true);
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!editingCategory || !newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a category name'
      });
      return;
    }

    try {
      console.log('🔄 Updating category with ID:', editingCategory.id, 'Name:', newPageCategoryName.trim());

      // Prepare update data (only the fields that can be updated)
      const updateData = {
        name: newPageCategoryName.trim(),
        description: `Category: ${newPageCategoryName.trim()}`,
        updatedAt: new Date().toISOString()
      };

      // Use the Firebase document ID directly
      console.log('🌍 Updating category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.updateCategory(currentZone.id, editingCategory.id, updateData);

      if (result.success) {
        console.log('✅ Category updated successfully');
        addToast({
          type: 'success',
          message: 'Category updated successfully'
        });

        // Reload categories from database
        const categories = await ZoneDatabaseService.getCategories(currentZone.id);
        setDbCategories(categories as any);

        setEditingCategory(null);
        setNewPageCategoryName('');
        setShowCategoryModal(false);
        refreshData();

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.updateCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, `Updated category: ${newPageCategoryName.trim()}`);
        }
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('❌ Error updating category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update category'
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    // Check if this is a real database category or a song-based category
    const isDbCategory = dbCategories.some(dbCat => dbCat.id === category.id);

    if (!isDbCategory) {
      // This is a song-based category that doesn't exist in the database
      addToast({
        type: 'error',
        message: 'This category only exists in songs and cannot be deleted from here. Update the songs to remove this category.'
      });
      return;
    }

    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!categoryToDelete) return;

    try {
      console.log('🗑️ Deleting category with ID:', categoryToDelete.id);

      // Use the Firebase document ID directly
      console.log('🌍 Deleting category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.deleteCategory(currentZone.id, categoryToDelete.id);

      if (result.success) {
        console.log('✅ Category deleted successfully');
        addToast({
          type: 'success',
          message: 'Category deleted successfully'
        });

        // Reload categories from database
        const categories = await ZoneDatabaseService.getCategories(currentZone.id);
        setDbCategories(categories as any);

        setShowDeleteCategoryDialog(false);
        setCategoryToDelete(null);
        refreshData();

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.deleteCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, `Deleted category: ${categoryToDelete.name}`);
        }
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete category'
      });
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteCategoryDialog(false);
    setCategoryToDelete(null);
  };

  // Page category management functions
  const handleAddPageCategory = async () => {
    console.log('🎯 handleAddPageCategory called with name:', newPageCategoryName);

    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a page category name'
      });
      return;
    }

    try {
      const newPageCategoryData: any = {
        name: newPageCategoryName.trim(),
        description: newPageCategoryDescription.trim() || `Page category: ${newPageCategoryName.trim()}`,
        image: newPageCategoryImage.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🌍 Creating page category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.createPageCategory(currentZone.id, newPageCategoryData);

      if (result.success) {
        console.log('✅ Page category added successfully');
        addToast({
          type: 'success',
          message: 'Page category added successfully'
        });

        // Reload page categories from database
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);

        setNewPageCategoryName('');
        setNewPageCategoryDescription('');
        setNewPageCategoryImage('');
        setShowPageCategoryModal(false);
        refreshData();

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.createCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, newPageCategoryName.trim());
        }
      } else {
        throw new Error(('error' in result ? result.error : 'Failed to create page category') as string);
      }
    } catch (error) {
      console.error('❌ Error adding page category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add page category'
      });
    }
  };

  const handleEditPageCategory = (pageCategory: any) => {
    setEditingPageCategory(pageCategory);
    setNewPageCategoryName(pageCategory.name);
    setNewPageCategoryDescription(pageCategory.description || '');
    setNewPageCategoryImage(pageCategory.image || '');
    setShowPageCategoryModal(true);
  };

  const handleUpdatePageCategory = async () => {
    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!editingPageCategory || !newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a page category name'
      });
      return;
    }

    try {
      const updatedData = {
        name: newPageCategoryName.trim(),
        description: newPageCategoryDescription.trim() || `Page category: ${newPageCategoryName.trim()}`,
        image: newPageCategoryImage.trim() || '',
        updatedAt: new Date()
      };

      console.log('🌍 Updating page category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.updatePageCategory(currentZone.id, editingPageCategory.id, updatedData);

      if (result.success) {
        console.log('✅ Page category updated successfully');
        addToast({
          type: 'success',
          message: 'Page category updated successfully'
        });

        // Reload page categories from database
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);

        setEditingPageCategory(null);
        setNewPageCategoryName('');
        setNewPageCategoryDescription('');
        setNewPageCategoryImage('');
        setShowPageCategoryModal(false);
        refreshData();

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.updateCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, `Updated page category: ${newPageCategoryName.trim()}`);
        }
      } else {
        throw new Error('Failed to update page category');
      }
    } catch (error) {
      console.error('❌ Error updating page category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update page category'
      });
    }
  };

  const handleDeletePageCategory = (pageCategory: any) => {
    setPageCategoryToDelete(pageCategory);
    setShowDeletePageCategoryDialog(true);
  };

  const confirmDeletePageCategory = async () => {
    if (!currentZone) {
      addToast({
        type: 'error',
        message: 'No zone selected'
      });
      return;
    }

    if (!pageCategoryToDelete) return;

    try {
      console.log('🗑️ Deleting page category with ID:', pageCategoryToDelete.id);

      console.log('🌍 Deleting page category for zone:', currentZone.id);
      const result = await ZoneDatabaseService.deletePageCategory(currentZone.id, pageCategoryToDelete.id);

      if (result.success) {
        console.log('✅ Page category deleted successfully');
        addToast({
          type: 'success',
          message: 'Page category deleted successfully'
        });

        // Reload page categories from database
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);

        setShowDeletePageCategoryDialog(false);
        setPageCategoryToDelete(null);
        refreshData();

        // Log admin action
        if (user && currentZone) {
          const roleName = getFullRoleName(currentZone.id, profile?.first_name, profile?.last_name);
          logAdminAction.deleteCategory({ 
            id: user.uid, 
            username: user.email || getRoleTerminology(currentZone.id).singular.toLowerCase(),
            fullName: roleName
          }, `Deleted page category: ${pageCategoryToDelete.name}`);
        }
      } else {
        throw new Error('Failed to delete page category');
      }
    } catch (error) {
      console.error('❌ Error deleting page category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete page category'
      });
    }
  };

  const cancelDeletePageCategory = () => {
    setShowDeletePageCategoryDialog(false);
    setPageCategoryToDelete(null);
  };

  // Page management functions
  const handleAddPage = async () => {
    if (!newPageName.trim() || !newPageDate.trim() || !newPageLocation.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsCreatingPage(true);

    try {
      // Create the page first to get a Firebase-generated ID for banner upload
      const newPage: Omit<PraiseNight, 'id'> = {
        name: newPageName.trim(),
        date: newPageDate.trim(),
        location: newPageLocation.trim(),
        category: newPageCategory,
        pageCategory: newPagePageCategory || undefined, // Save selected page category
        countdown: {
          days: newPageDays,
          hours: newPageHours,
          minutes: newPageMinutes,
          seconds: newPageSeconds
        },
        songs: [],
        bannerImage: newPageBannerImage,
        firebaseId: ''
      };

      console.log('🔥 Creating page with data:', newPage);
      const result = await ZoneDatabaseService.createPraiseNight(currentZone?.id || '', newPage);

      if (result.success && 'id' in result && result.id) {
        console.log('✅ Page created with Firebase-generated ID:', result.id);

        // Upload banner image if a new file was selected
        let bannerImageUrl = newPageBannerImage;
        if (newPageBannerFile) {
          console.log('📤 Uploading banner image for Firebase ID:', result.id);
          const uploadResult = await uploadBannerImage(newPageBannerFile, result.id!);
          if (uploadResult.success && uploadResult.url) {
            bannerImageUrl = uploadResult.url;
            console.log('✅ Banner image uploaded:', bannerImageUrl);

            // Update the page with the banner image URL
            await ZoneDatabaseService.updatePraiseNight(
              result.id!,
              { bannerImage: bannerImageUrl },
              currentZone?.id
            );
          } else {
            console.warn('⚠️ Banner image upload failed:', uploadResult.error);
          }
        }

        addToast({
          type: 'success',
          message: 'Page created successfully!'
        });

        // Reset form
        setNewPageName('');
        setNewPageDate('');
        setNewPageLocation('');
        setNewPageDescription('');
        setNewPageCategory('unassigned');
        setNewPageDays(0);
        setNewPageHours(0);
        setNewPageMinutes(0);
        setNewPageSeconds(0);
        setNewPageBannerImage('');
        setNewPageBannerFile(null);
        setShowPageModal(false);
        refreshData();

        console.log('✅ Page creation completed successfully');
      } else {
        throw new Error('Failed to add page');
      }
    } catch (error) {
      console.error('❌ Error adding page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add page'
      });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleEditPage = (page: PraiseNight) => {
    console.log('📝 Editing page:', page);
    console.log('📂 Page category from DB:', page.pageCategory);
    setEditingPage(page);
    setNewPageName(page.name);
    setNewPageDate(page.date);
    setNewPageLocation(page.location);
    setNewPageDescription(''); // Description not supported in PraiseNight type
    setNewPageCategory(page.category);
    setNewPagePageCategory(page.pageCategory || ''); // Set page category
    console.log('✅ Set page category to:', page.pageCategory || '');
    // Use countdown object directly
    setNewPageDays(page.countdown.days);
    setNewPageHours(page.countdown.hours);
    setNewPageMinutes(page.countdown.minutes);
    setNewPageSeconds(page.countdown.seconds);
    setNewPageBannerImage(page.bannerImage || '');
    setNewPageBannerFile(null);
    setShowPageModal(true);
  };

  const handleUpdatePage = async () => {
    if (!editingPage || !newPageName.trim() || !newPageDate.trim() || !newPageLocation.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsCreatingPage(true);

    try {
      let bannerImageUrl = newPageBannerImage;

      // Upload banner image if a new file was selected
      if (newPageBannerFile) {
        const uploadResult = await uploadBannerImage(newPageBannerFile, editingPage.firebaseId || editingPage.id.toString());
        if (uploadResult.success && uploadResult.url) {
          bannerImageUrl = uploadResult.url;
        } else {
          throw new Error('Failed to upload banner image');
        }
      }

      // Prepare page data
      const pageData = {
        name: newPageName.trim(),
        date: newPageDate.trim(),
        location: newPageLocation.trim(),
        category: newPageCategory,
        pageCategory: newPagePageCategory || null, // Add page category
        bannerImage: bannerImageUrl || null,
        countdown: {
          days: newPageDays,
          hours: newPageHours,
          minutes: newPageMinutes,
          seconds: newPageSeconds
        }
      };

      console.log('🔄 Updating page with data:', pageData);

      // Update the page in Firebase (HQ / Zone aware)
      const result = await ZoneDatabaseService.updatePraiseNight(
        editingPage.firebaseId || editingPage.id.toString(),
        pageData,
        currentZone?.id
      );

      if (result.success) {
        console.log('✅ Page updated successfully');
        addToast({
          type: 'success',
          message: 'Page updated successfully'
        });

        // Reset form
        setEditingPage(null);
        setNewPageName('');
        setNewPageDate('');
        setNewPageLocation('');
        setNewPageDescription('');
        setNewPageCategory('unassigned');
        setNewPagePageCategory(''); // Reset page category
        setNewPageDays(0);
        setNewPageHours(0);
        setNewPageMinutes(0);
        setNewPageSeconds(0);
        setNewPageBannerImage('');
        setNewPageBannerFile(null);
        setShowPageModal(false);
        refreshData();

        console.log('✅ Page update completed successfully');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('❌ Error updating page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update page'
      });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleDeletePage = (page: PraiseNight) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;

    try {
      const result = await ZoneDatabaseService.deletePraiseNight(
        pageToDelete.firebaseId || pageToDelete.id.toString(),
        currentZone?.id
      );

      if (result.success) {
        console.log('✅ Page deleted successfully');
        addToast({
          type: 'success',
          message: 'Page deleted successfully'
        });

        setShowDeleteDialog(false);
        setPageToDelete(null);
        if (selectedPage?.id === pageToDelete.id) {
          setSelectedPage(null);
        }
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.deletePage(currentAdmin, `Deleted page: ${pageToDelete.name}`);
        }
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      console.error('❌ Error deleting page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete page'
      });
    }
  };

  const cancelDeletePage = () => {
    setShowDeleteDialog(false);
    setPageToDelete(null);
  };

  // Song management functions
  const handleEditSong = (song: PraiseNightSong) => {
    console.log('🎵 [FRESH] Editing song:', song.title, 'ID:', song.id);
    setEditingSong(song);
    setShowSongModal(true);
  };

  const handleDeleteSong = (song: PraiseNightSong) => {
    setSongToDelete(song);
    setShowDeleteSongDialog(true);
  };

  const handleToggleSongStatus = async (song: PraiseNightSong) => {
    try {
      const newStatus = song.status === 'heard' ? 'unheard' : 'heard';

      if (!song.id) {
        throw new Error('Invalid song ID for status update');
      }

      const result = await PraiseNightSongsService.updateSongStatus(song.id, newStatus, currentZone?.id);

      if (result.success) {
        console.log('✅ [FRESH] Song status updated successfully');
        addToast({
          type: 'success',
          message: `Song marked as ${newStatus}`
        });
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.updateSong(currentAdmin, `Updated song status: ${song.title} -> ${newStatus}`);
        }
      } else {
        throw new Error(result.error || 'Failed to update song status');
      }
    } catch (error) {
      console.error('❌ Error updating song status:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update song status'
      });
    }
  };

  const handleToggleSongActive = async (song: PraiseNightSong) => {
    try {
      const newActiveStatus = !(song as any).isActive;

      if (!song.id) {
        throw new Error('Invalid song ID for active status update');
      }

      const result = await PraiseNightSongsService.updateSong(song.id, {
        isActive: newActiveStatus
      }, currentZone?.id);

      if (result.success) {
        console.log('✅ [FRESH] Song active status updated successfully');
        addToast({
          type: 'success',
          message: newActiveStatus ? `🔴 ${song.title} is now ACTIVE (users see blinking border)` : `Song deactivated`
        });
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.updateSong(currentAdmin, `Set song active status: ${song.title} -> ${newActiveStatus ? 'ACTIVE' : 'INACTIVE'}`);
        }
      } else {
        throw new Error(result.error || 'Failed to update song active status');
      }
    } catch (error) {
      console.error('❌ Error updating song active status:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update song active status'
      });
    }
  };

  const handleSaveSong = async (songData: PraiseNightSong) => {
    try {
      console.log('💾 [FRESH] Saving song:', songData.title);

      let result;

      // SIMPLE: Check if we're editing (has ID) or creating (no ID)
      const isEditingExistingSong = editingSong && editingSong.id;

      if (isEditingExistingSong) {
        // UPDATE existing song
        console.log('🔄 [FRESH] Updating song ID:', editingSong.id);

        result = await PraiseNightSongsService.updateSong(editingSong.id!, songData, currentZone?.id);

        if (result.success) {
          console.log('✅ [FRESH] Song updated successfully');
          addToast({
            type: 'success',
            message: 'Song updated successfully'
          });

          // Log admin action
          if (currentAdmin) {
            logAdminAction.updateSong(currentAdmin, `Updated song: ${songData.title}`);
          }
        } else {
          console.error('❌ [FRESH] Song update failed:', result.error);
          addToast({
            type: 'error',
            message: result.error || 'Failed to update song'
          });
        }
      } else {
        // CREATE new song
        console.log('➕ [FRESH] Creating new song');
        console.log('🔍 DEBUG - Selected Page:', {
          selectedPageId: selectedPage?.id,
          selectedPageFirebaseId: selectedPage?.firebaseId,
          songDataPraiseNightId: songData.praiseNightId
        });

        // Ensure praiseNightId is set
        const newSongData = {
          ...songData,
          praiseNightId: selectedPage?.firebaseId || selectedPage?.id || songData.praiseNightId
        };
        
        console.log('🔍 DEBUG - New Song Data:', {
          title: newSongData.title,
          praiseNightId: newSongData.praiseNightId,
          category: newSongData.category,
          categories: newSongData.categories
        });

        result = await PraiseNightSongsService.createSong(newSongData, currentZone?.id);

        if (result.success) {
          console.log('✅ [FRESH] Song created with ID:', result.id);
          addToast({
            type: 'success',
            message: 'Song added successfully'
          });

          // Log admin action
          if (currentAdmin) {
            logAdminAction.addSong(currentAdmin, songData.title, songData.category);
          }
        } else {
          console.error('❌ [FRESH] Song creation failed:', result.error);
          addToast({
            type: 'error',
            message: result.error || 'Failed to create song'
          });
        }
      }

      if (result?.success) {
        console.log('✅ Song operation successful, refreshing data...');
        console.log('🎵 Result from song operation:', result);
        setEditingSong(null);
        setShowSongModal(false);
        
        // Add a small delay to ensure Firebase has processed the change
        setTimeout(() => {
          console.log('🔄 Calling refreshData after delay...');
          refreshData();
        }, 500);
      } else {
        throw new Error('Failed to save song');
      }
    } catch (error) {
      console.error('❌ Error saving song:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save song'
      });
    }
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete) return;

    try {
      if (!songToDelete.id) {
        throw new Error('No valid song ID found for deletion');
      }

      console.log('🗑️ [FRESH] Deleting song:', songToDelete.title, 'ID:', songToDelete.id);

      const deleteResult = await PraiseNightSongsService.deleteSong(songToDelete.id, currentZone?.id);

      if (deleteResult.success) {
        console.log('✅ [FRESH] Song deleted successfully');
        addToast({
          type: 'success',
          message: 'Song deleted successfully'
        });

        setShowDeleteSongDialog(false);
        setSongToDelete(null);
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.deleteSong(currentAdmin, songToDelete.title);
        }
      } else {
        throw new Error(deleteResult.error || 'Failed to delete song');
      }
    } catch (error) {
      console.error('❌ Error deleting song:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete song'
      });
    }
  };

  const cancelDeleteSong = () => {
    setShowDeleteSongDialog(false);
    setSongToDelete(null);
  };

  // Additional category functions for page categories


  const handleEditCategoryContent = (content: any) => {
    // Handle editing category content (songs)
    if (content && content.id) {
      handleEditSong(content);
    }
  };

  const handleDeleteCategoryContent = (id: string) => {
    // Handle deleting category content (songs)
    const song = allSongs.find(s => s.id?.toString() === id);
    if (song) {
      handleDeleteSong(song);
    }
  };

  // Don't show loading skeleton - data loads in background
  // Show content immediately with cached data
  if (false) {  // Disabled - no skeleton on revisits
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-4"></div>
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading admin data</p>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Content shows immediately - no blocking states

  // Check if user is Boss
  const isBoss = profile?.role === 'boss' || profile?.email?.toLowerCase().startsWith('boss')
  const isBossZone = currentZone?.id === 'zone-boss'
  
  // Don't block on zone - show content immediately, zone loads in background

  // Temporarily show coordinator status for debugging
  // if (!isZoneCoordinator) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-6">
  //       <div className="max-w-md text-center">
  //         <p className="text-gray-600 mb-4">isZoneCoordinator: {String(isZoneCoordinator)}</p>
  //         <p className="text-gray-600 mb-4">User ID: {user?.uid}</p>
  //         <button
  //           onClick={() => router.push('/home')}
  //           className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  //         >
  //           Go to Home
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  // Get zone theme colors (use default if zone not loaded yet)
  const zoneTheme = getZoneTheme(currentZone?.themeColor || 'purple');

  // Add PageCategoriesSection to the active sections
  return (
    <AdminThemeProvider>
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        sidebarCollapsed={!isSidebarOpen}
        setSidebarCollapsed={(collapsed) => setIsSidebarOpen(!collapsed)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isHQAdmin={isHQAdmin}
        pendingSubGroupCount={pendingSubGroupCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-0">
        {/* Mobile Header - Clean native design (single header only) */}
        {!(activeSection === 'Pages' && selectedPage) && (
          <AdminMobileHeader
            title={activeSection}
            showBack={true}
            onBack={() => router.push('/home')}
          />
        )}

        {activeSection === 'Dashboard' && <DashboardSection onSectionChange={setActiveSection} />}
        {activeSection === 'Analytics' && isHQAdmin && <AnalyticsSection />}
        
        {activeSection === 'Pages' && (
          <PagesSection
            allPraiseNights={allPraiseNights}
            loading={loading}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            allSongs={allSongs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            showPageModal={showPageModal}
            setShowPageModal={setShowPageModal}
            editingPage={editingPage}
            setEditingPage={setEditingPage}
            newPageName={newPageName}
            setNewPageName={setNewPageName}
            newPageDate={newPageDate}
            setNewPageDate={setNewPageDate}
            newPageLocation={newPageLocation}
            setNewPageLocation={setNewPageLocation}
            newPageDescription={newPageDescription}
            setNewPageDescription={setNewPageDescription}
            newPageCategory={newPageCategory}
            setNewPageCategory={setNewPageCategory}
            newPagePageCategory={newPagePageCategory}
            setNewPagePageCategory={setNewPagePageCategory}
            newPageDays={newPageDays}
            setNewPageDays={setNewPageDays}
            newPageHours={newPageHours}
            setNewPageHours={setNewPageHours}
            newPageMinutes={newPageMinutes}
            setNewPageMinutes={setNewPageMinutes}
            newPageSeconds={newPageSeconds}
            setNewPageSeconds={setNewPageSeconds}
            newPageBannerImage={newPageBannerImage}
            setNewPageBannerImage={setNewPageBannerImage}
            newPageBannerFile={newPageBannerFile}
            setNewPageBannerFile={setNewPageBannerFile}
            isCreatingPage={isCreatingPage}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            pageToDelete={pageToDelete}
            setPageToDelete={setPageToDelete}
            handleAddPage={handleAddPage}
            handleEditPage={handleEditPage}
            handleUpdatePage={handleUpdatePage}
            handleDeletePage={handleDeletePage}
            confirmDeletePage={confirmDeletePage}
            cancelDeletePage={cancelDeletePage}
            handleEditSong={handleEditSong}
            handleDeleteSong={handleDeleteSong}
            handleToggleSongStatus={handleToggleSongStatus}
            handleToggleSongActive={handleToggleSongActive}
            allCategories={allCategories}
            addToast={addToast}
          />
        )}

        {activeSection === 'Categories' && (
          <CategoriesSection
            allCategories={allCategories}
            allSongs={allSongs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            showCategoryModal={showCategoryModal}
            setShowCategoryModal={setShowCategoryModal}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            newPageCategoryName={newPageCategoryName}
            setNewPageCategoryName={setNewPageCategoryName}
            showDeleteCategoryDialog={showDeleteCategoryDialog}
            setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
            categoryToDelete={categoryToDelete}
            setCategoryToDelete={setCategoryToDelete}
            handleAddCategory={handleAddCategory}
            handleEditCategory={handleEditCategory}
            handleUpdateCategory={handleUpdateCategory}
            handleDeleteCategory={handleDeleteCategory}
            confirmDeleteCategory={confirmDeleteCategory}
            cancelDeleteCategory={cancelDeleteCategory}
            handleEditCategoryContent={handleEditCategoryContent}
            handleDeleteCategoryContent={handleDeleteCategoryContent}
            addToast={addToast}
          />
        )}

        {activeSection === 'Page Categories' && (
          <PageCategoriesSection
            pageCategories={pageCategories}
            pages={pages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onPageClick={(page) => {
              // Switch to Pages section and select this page
              setActiveSection('Pages');
              setSelectedPage(page);
              addToast({
                type: 'success',
                message: `Viewing "${page.name}"`
              });
            }}
            showPageCategoryModal={showPageCategoryModal}
            setShowPageCategoryModal={setShowPageCategoryModal}
            editingPageCategory={editingPageCategory}
            setEditingPageCategory={setEditingPageCategory}
            newPageCategoryName={newPageCategoryName}
            setNewPageCategoryName={setNewPageCategoryName}
            newPageCategoryDescription={newPageCategoryDescription}
            setNewPageCategoryDescription={setNewPageCategoryDescription}
            newPageCategoryImage={newPageCategoryImage}
            setNewPageCategoryImage={setNewPageCategoryImage}
            showDeletePageCategoryDialog={showDeletePageCategoryDialog}
            setShowDeletePageCategoryDialog={setShowDeletePageCategoryDialog}
            pageCategoryToDelete={pageCategoryToDelete}
            setPageCategoryToDelete={setPageCategoryToDelete}
            handleAddPageCategory={handleAddPageCategory}
            handleEditPageCategory={handleEditPageCategory}
            handleUpdatePageCategory={handleUpdatePageCategory}
            handleDeletePageCategory={handleDeletePageCategory}
            confirmDeletePageCategory={confirmDeletePageCategory}
            cancelDeletePageCategory={cancelDeletePageCategory}
            addToast={addToast}
          />
        )}

        {activeSection === 'Submitted Songs' && (
          <div className="h-full overflow-auto bg-gray-50">
            <SubmittedSongsPage embedded={true} />
          </div>
        )}
        {activeSection === 'Members' && <MembersSection />}
        {activeSection === 'Media' && <MediaSection />}
        {activeSection === 'Media Upload' && isHQAdmin && <MediaUploadSection />}
        {activeSection === 'Master Library' && <MasterLibrarySection isHQAdmin={isHQAdmin} />}
        {activeSection === 'Sub-Groups' && <SubGroupsSection />}
        {activeSection === 'Calendar' && <CalendarSection />}
        {activeSection === 'Notifications' && <SimpleNotificationsSection />}
      </div>

      {/* Modals */}
      <AdminModals
        showPageModal={showPageModal}
        setShowPageModal={setShowPageModal}
        editingPage={editingPage}
        setEditingPage={setEditingPage}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        newPageDate={newPageDate}
        setNewPageDate={setNewPageDate}
        newPageLocation={newPageLocation}
        setNewPageLocation={setNewPageLocation}
        newPageDescription={newPageDescription}
        setNewPageDescription={setNewPageDescription}
        newPageCategory={newPageCategory}
        setNewPageCategory={setNewPageCategory}
        newPagePageCategory={newPagePageCategory}
        setNewPagePageCategory={setNewPagePageCategory}
        newPageDays={newPageDays}
        setNewPageDays={setNewPageDays}
        newPageHours={newPageHours}
        setNewPageHours={setNewPageHours}
        newPageMinutes={newPageMinutes}
        setNewPageMinutes={setNewPageMinutes}
        newPageSeconds={newPageSeconds}
        setNewPageSeconds={setNewPageSeconds}
        newPageBannerImage={newPageBannerImage}
        setNewPageBannerImage={setNewPageBannerImage}
        newPageBannerFile={newPageBannerFile}
        setNewPageBannerFile={setNewPageBannerFile}
        handleAddPage={handleAddPage}
        handleUpdatePage={handleUpdatePage}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        editingPageCategory={editingPageCategory}
        setEditingPageCategory={setEditingPageCategory}
        newPageCategoryName={newPageCategoryName}
        setNewPageCategoryName={setNewPageCategoryName}
        newPageCategoryDescription={newPageCategoryDescription}
        setNewPageCategoryDescription={setNewPageCategoryDescription}
        handleAddCategory={handleAddCategory}
        handleUpdateCategory={handleUpdateCategory}
        handleAddPageCategory={handleAddPageCategory}
        handleUpdatePageCategory={handleUpdatePageCategory}
        activeSection={activeSection}
        showSongModal={showSongModal}
        setShowSongModal={setShowSongModal}
        editingSong={editingSong}
        setEditingSong={setEditingSong}
        allCategories={allCategories}
        pages={pages}
        handleSaveSong={handleSaveSong}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        pageToDelete={pageToDelete}
        setPageToDelete={setPageToDelete}
        confirmDeletePage={confirmDeletePage}
        cancelDeletePage={cancelDeletePage}
        showDeleteSongDialog={showDeleteSongDialog}
        setShowDeleteSongDialog={setShowDeleteSongDialog}
        songToDelete={songToDelete}
        setSongToDelete={setSongToDelete}
        confirmDeleteSong={confirmDeleteSong}
        cancelDeleteSong={cancelDeleteSong}
        showDeleteCategoryDialog={showDeleteCategoryDialog}
        setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
        categoryToDelete={categoryToDelete}
        setCategoryToDelete={setCategoryToDelete}
        confirmDeleteCategory={confirmDeleteCategory}
        cancelDeleteCategory={cancelDeleteCategory}
        pageCategories={pageCategories}
      />

      {/* Mobile Bottom Navigation */}
      <AdminMobileNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onMenuOpen={() => setIsSidebarOpen(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    </AdminThemeProvider>
  );
}
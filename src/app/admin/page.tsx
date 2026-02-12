"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { FileText } from "lucide-react";
import CustomLoader from '@/components/CustomLoader';

import { PraiseNightSong, PraiseNight, Category } from '../../types/supabase';
import { useAdminData } from '../../hooks/useAdminData';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
import { logAdminAction } from '@/lib/admin-activity-logger';
import { uploadBannerImage } from '@/utils/imageUpload';
import { ToastContainer, Toast } from '../../components/Toast';
import ZoneSwitcher from '@/components/ZoneSwitcher';
import { getRoleTerminology, getFullRoleName, getZoneTheme } from '@/utils/zone-theme';
import { AdminThemeProvider } from '../../components/admin/AdminThemeProvider';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminMobileNav from '../../components/admin/AdminMobileNav';
import AdminMobileHeader from '../../components/admin/AdminMobileHeader';
// Dynamic imports for improved hydration and performance
const PagesSection = dynamic(() => import('../../components/admin/PagesSection'), { ssr: false });
const CategoriesSection = dynamic(() => import('../../components/admin/CategoriesSection'), { ssr: false });
const MediaSection = dynamic(() => import('../../components/admin/MediaSection'), { ssr: false });
const MediaUploadSection = dynamic(() => import('../../components/admin/MediaUploadSection'), { ssr: false });
const MembersSection = dynamic(() => import('../../components/admin/MembersSection'), { ssr: false });
const SimpleNotificationsSection = dynamic(() => import('../../components/admin/SimpleNotificationsSection'), { ssr: false });
const PageCategoriesSection = dynamic(() => import('../../components/admin/PageCategoriesSection'), { ssr: false });
const DashboardSection = dynamic(() => import('../../components/admin/DashboardSection'), { ssr: false });
const MasterLibrarySection = dynamic(() => import('../../components/admin/MasterLibrarySection'), { ssr: false });
const SubGroupsSection = dynamic(() => import('../../components/admin/SubGroupsSection'), { ssr: false });
const AnalyticsSection = dynamic(() => import('../../components/admin/AnalyticsSection'), { ssr: false });
const CalendarSection = dynamic(() => import('../../components/admin/CalendarSection'), { ssr: false });
const ActivityLogsPage = dynamic(() => import('../../components/admin/ActivityLogsPage'), { ssr: false });
const SupportChatSection = dynamic(() => import('../../components/admin/SupportChatSection'), { ssr: false });
const SubmittedSongsPage = dynamic(() => import('../pages/admin/submitted-songs/page'), { ssr: false });
const PaymentDashboardSection = dynamic(() => import('../../components/admin/PaymentDashboardSection'), { ssr: false });
const AdminModals = dynamic(() => import('../../components/admin/AdminModals'), { ssr: false });
const CategoryOrderModal = dynamic(() => import('../../components/admin/CategoryOrderModal'), { ssr: false });
const PageCategoryOrderModal = dynamic(() => import('../../components/admin/PageCategoryOrderModal'), { ssr: false });
import { useZoneSubGroups } from '../../hooks/useSubGroup';

function AdminContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, isLoading: authLoading } = useAuth()

  // Hydration guard - must be the first state
  const [hasMounted, setHasMounted] = React.useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const isHQAdmin = Boolean(profile?.email && [
    'ihenacho23@gmail.com',
    'ephraimloveworld1@gmail.com',
    'takeshopstores@gmail.com',
    'nnennawealth@gmail.com',
    'joykures@gmail.com'
  ].includes(profile.email.toLowerCase()))

  const isRestrictedAdmin = profile?.email?.toLowerCase() === 'joykures@gmail.com'

  // UI state
  const [activeSection, setActiveSection] = useState(isRestrictedAdmin ? 'Pages' : 'Dashboard');
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
  const [showCategoryOrderModal, setShowCategoryOrderModal] = useState(false);
  const [showPageCategoryOrderModal, setShowPageCategoryOrderModal] = useState(false);

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
      setZoneId(currentZone.id);
    }
  }, [currentZone, setZoneId]);

  // 🔄 Restore Admin state from URL on mount/change
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const pageIdParam = searchParams.get('pageId');
    const categoryParam = searchParams.get('category');

    if (sectionParam && sectionParam !== activeSection) {
      const validSections = [
        'Dashboard', 'Pages', 'Categories', 'Media', 'Library',
        'Members', 'Notifications', 'Sub-Groups', 'Analytics',
        'Calendar', 'Activity Logs', 'Submitted Songs', 'Support Chat', 'Payments'
      ];
      if (validSections.includes(sectionParam)) {
        setActiveSection(sectionParam);
      }
    }

    if (pageIdParam && (!selectedPage || selectedPage.id !== pageIdParam) && allPraiseNights.length > 0) {
      const page = allPraiseNights.find(p => p.id === pageIdParam);
      if (page) {
        setSelectedPage(page);
      }
    }

    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, allPraiseNights]);

  // 💾 Save Admin state to URL when changed
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', activeSection);

    if (selectedPage) {
      params.set('pageId', selectedPage.id);
    } else {
      params.delete('pageId');
    }

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    const newUrl = `/admin?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [activeSection, selectedPage, selectedCategory, router, searchParams]);


  const [loadingSongs, setLoadingSongs] = useState(false);


  useEffect(() => {
    if (selectedPage) {
      setLoadingSongs(true);

      getCurrentSongs(selectedPage.id, true).then(songs => {
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
  }, [selectedPage, getCurrentSongs, allPraiseNights]);

  // Update selectedPage reference when allPraiseNights refreshes to ensure we have latest data
  useEffect(() => {
    if (selectedPage && allPraiseNights) {
      const updatedPage = allPraiseNights.find(p => p.id === selectedPage.id);
      if (updatedPage && JSON.stringify(updatedPage) !== JSON.stringify(selectedPage)) {
        setSelectedPage(updatedPage);
      }
    }
  }, [allPraiseNights, selectedPage]);




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
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        });
      }
    });

    return combinedCategories;
  }, [dbCategories, allAvailableCategories]);

  // Load categories from database (zone-aware)
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentZone) {
        return;
      }

      try {
        const categories = await ZoneDatabaseService.getCategories(currentZone.id);

        // Map categories to include both Firebase ID and Supabase ID
        const mappedCategories = categories.map(category => ({
          ...category,
          firebaseId: category.id, // Firebase document ID (string)
          id: category.id, // Keep Firebase ID as primary ID
          supabaseId: category.id // This will be the Firebase ID for now
        }));

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
        return;
      }

      try {
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);
      } catch (error) {
        console.error('Error loading page categories:', error);
      }
    };

    loadPageCategories();
  }, [currentZone]);

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Wait for Firebase auth to finish loading first
    if (authLoading) {
      return
    }

    // Don't redirect - just return nothing if no user
    if (!user) {
      return
    }

    // Wait for zone context to finish loading before checking permissions
    if (zoneLoading) {
      return
    }

    // Wait for zone to be available
    if (!currentZone) {
      return
    }

    // Only check auth ONCE on initial load to prevent redirect loops
    if (hasCheckedAuth) {
      return
    }

    // Blocklist - users who should never have admin access even if they're coordinators
    const BLOCKED_ADMIN_EMAILS = [
      'lliamzelvin@gmail.com'
    ]

    const isBlocked = Boolean(profile?.email && BLOCKED_ADMIN_EMAILS.includes(profile.email.toLowerCase()))

    if (isBlocked) {
      router.push('/home')
      return
    }

    const isHQAdminCheck = Boolean(profile?.email && [
      'ihenacho23@gmail.com',
      'ephraimloveworld1@gmail.com',
      'takeshopstores@gmail.com',
      'nnennawealth@gmail.com',
      'joykures@gmail.com'
    ].includes(profile.email.toLowerCase()))

    // Give a small delay to ensure zone role is properly loaded from cache
    const checkAccess = () => {
      if (!isZoneCoordinator && !isHQAdminCheck) {
        router.push('/home')
        return
      }

      // Mark auth as checked so we don't redirect on subsequent re-renders
      setHasCheckedAuth(true)

      const role = getRoleTerminology(currentZone.id);
    }

    // Small delay to ensure zone data is fully loaded from cache
    const timer = setTimeout(checkAccess, 500)
    return () => clearTimeout(timer)
  }, [user, isZoneCoordinator, currentZone, zoneLoading, router, hasCheckedAuth, profile?.email, authLoading]);

  const pages = useMemo(() => {

    if (loading) {
      return [];
    }

    if (!allPraiseNights) {
      return [];
    }

    return allPraiseNights;
  }, [allPraiseNights, loading]);

  // Only show brief loading if absolutely no user data exists
  // This should rarely happen since auth is cached
  if (!profile && !user && authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <CustomLoader message="Verifying admin credentials..." />
      </div>
    );
  }

  // Toast helper functions
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);

    // Detect action from message
    let detectedAction = 'unknown';
    const message = toast.message.toLowerCase();

    if (message.includes('created') || message.includes('added')) {
      detectedAction = 'created';
    } else if (message.includes('updated') || message.includes('modified') || message.includes('changed')) {
      detectedAction = 'updated';
    } else if (message.includes('deleted') || message.includes('removed')) {
      detectedAction = 'deleted';
    } else if (message.includes('approved')) {
      detectedAction = 'updated';
    } else if (message.includes('rejected')) {
      detectedAction = 'updated';
    } else if (message.includes('published') || message.includes('imported')) {
      detectedAction = 'created';
    }

    // Detect section from message
    let detectedSection = 'admin';
    if (message.includes('page') || message.includes('praise night')) {
      detectedSection = 'pages';
    } else if (message.includes('category')) {
      detectedSection = 'categories';
    } else if (message.includes('song') || message.includes('history')) {
      detectedSection = 'songs';
    } else if (message.includes('subgroup') || message.includes('sub-group')) {
      detectedSection = 'subgroups';
    } else if (message.includes('master library')) {
      detectedSection = 'master_library';
    } else if (message.includes('media')) {
      detectedSection = 'media';
    }

    // Extract item name from message
    let itemName = null;
    const nameMatch = toast.message.match(/["']([^"']+)["']/);
    if (nameMatch) {
      itemName = nameMatch[1];
    }

    // Get real user info
    const userName = currentAdmin?.fullName ||
      currentAdmin?.username ||
      localStorage.getItem('userName') ||
      localStorage.getItem('userEmail') ||
      'Admin';

    // Also dispatch global event for activity logging
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        message: toast.message,
        type: toast.type,
        userName: userName,
        action: detectedAction,
        section: detectedSection,
        itemName: itemName
      }
    }));
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // But we still need handleAdminLogout for the sidebar
  const handleAdminLogout = () => {
    if (currentAdmin) {
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

      const result = await ZoneDatabaseService.createCategory(currentZone.id, newCategory);

      if (result.success) {
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

      // Prepare update data (only the fields that can be updated)
      const updateData = {
        name: newPageCategoryName.trim(),
        description: `Category: ${newPageCategoryName.trim()}`,
        updatedAt: new Date().toISOString()
      };

      // Use the Firebase document ID directly
      const result = await ZoneDatabaseService.updateCategory(currentZone.id, editingCategory.id, updateData);

      if (result.success) {
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

      // Use the Firebase document ID directly
      const result = await ZoneDatabaseService.deleteCategory(currentZone.id, categoryToDelete.id);

      if (result.success) {
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

      const result = await ZoneDatabaseService.createPageCategory(currentZone.id, newPageCategoryData);

      if (result.success) {
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

  const handleUpdatePageCategoryOrder = async (updatedCategories: any[]) => {
    if (!currentZone) return;

    try {
      const result = await ZoneDatabaseService.updatePageCategoryOrder(currentZone.id, updatedCategories);

      if (result.success) {
        addToast({
          type: 'success',
          message: 'Page types reordered successfully'
        });

        // Refresh categories
        const categories = await ZoneDatabaseService.getPageCategories(currentZone.id);
        setPageCategories(categories);
        refreshData();
      } else {
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Failed to update page category order:', error);
      addToast({
        type: 'error',
        message: 'Failed to save order'
      });
    }
  };



  const handleUpdateCategoryOrder = async (pageId: string, categoryOrder: string[]) => {
    if (!currentZone) return;
    try {
      const result = await ZoneDatabaseService.updatePraiseNight(pageId, { categoryOrder }, currentZone.id);
      if (result.success) {
        addToast({
          type: 'success',
          message: 'Category order saved successfully'
        });
        refreshData();
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      addToast({
        type: 'error',
        message: 'Failed to save order'
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

      const result = await ZoneDatabaseService.updatePageCategory(currentZone.id, editingPageCategory.id, updatedData);

      if (result.success) {
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

      const result = await ZoneDatabaseService.deletePageCategory(currentZone.id, pageCategoryToDelete.id);

      if (result.success) {
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

      const result = await ZoneDatabaseService.createPraiseNight(currentZone?.id || '', newPage);

      if (result.success && 'id' in result && result.id) {

        // Upload banner image if a new file was selected
        let bannerImageUrl = newPageBannerImage;
        if (newPageBannerFile) {
          const uploadResult = await uploadBannerImage(newPageBannerFile, result.id!);
          if (uploadResult.success && uploadResult.url) {
            bannerImageUrl = uploadResult.url;

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
    setEditingPage(page);
    setNewPageName(page.name);
    setNewPageDate(page.date);
    setNewPageLocation(page.location);
    setNewPageDescription(''); // Description not supported in PraiseNight type
    setNewPageCategory(page.category);
    setNewPagePageCategory(page.pageCategory || ''); // Set page category
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


      const result = await ZoneDatabaseService.updatePraiseNight(
        editingPage.firebaseId || editingPage.id.toString(),
        pageData,
        currentZone?.id
      );

      if (result.success) {
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

      console.debug('🎯 [Admin] Toggling active status:', {
        songId: song.id,
        songTitle: song.title,
        currentActive: (song as any).isActive,
        newActive: newActiveStatus,
        praiseNightId: song.praiseNightId,
        zoneId: currentZone?.id
      });

      const result = await PraiseNightSongsService.updateSong(song.id, {
        isActive: newActiveStatus,
        praiseNightId: song.praiseNightId // ✅ CRITICAL: Include praiseNightId for metadata trigger
      }, currentZone?.id);

      if (result.success) {
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

      let result;

      // SIMPLE: Check if we're editing (has ID) or creating (no ID)
      const isEditingExistingSong = editingSong && editingSong.id;

      if (isEditingExistingSong) {

        result = await PraiseNightSongsService.updateSong(editingSong.id!, songData, currentZone?.id);

        if (result.success) {
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

        // Ensure praiseNightId is set
        const newSongData = {
          ...songData,
          praiseNightId: selectedPage?.firebaseId || selectedPage?.id || songData.praiseNightId
        };


        result = await PraiseNightSongsService.createSong(newSongData, currentZone?.id);

        if (result.success) {
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
        setEditingSong(null);
        setShowSongModal(false);

        // Add a small delay to ensure Firebase has processed the change
        setTimeout(() => {
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


      const deleteResult = await PraiseNightSongsService.deleteSong(songToDelete.id, currentZone?.id);

      if (deleteResult.success) {
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

  // Hydration protection - return a stable shell until mounted
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex overflow-hidden">
        {/* Simple skeleton matching the layout structure */}
        <div className="hidden lg:block w-64 bg-white border-r border-slate-200 h-screen" />
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden h-14 bg-white border-b border-slate-100" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm animate-pulse">Initializing Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Content shows immediately - no blocking states

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
          isRestrictedAdmin={isRestrictedAdmin}
          pendingSubGroupCount={pendingSubGroupCount}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-0">
          {/* Mobile Header - Clean native design (single header only) */}
          {!(activeSection === 'Pages' && selectedPage) && (
            <AdminMobileHeader
              title={activeSection}
            />
          )}

          {activeSection === 'Dashboard' && !isRestrictedAdmin && <DashboardSection onSectionChange={setActiveSection} />}
          {activeSection === 'Analytics' && isHQAdmin && !isRestrictedAdmin && <AnalyticsSection />}
          {activeSection === 'Payments' && isHQAdmin && !isRestrictedAdmin && <PaymentDashboardSection />}

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
              showCategoryOrderModal={showCategoryOrderModal}
              setShowCategoryOrderModal={setShowCategoryOrderModal}
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
              pageCategories={pageCategories}
              showPageCategoryOrderModal={showPageCategoryOrderModal}
              setShowPageCategoryOrderModal={setShowPageCategoryOrderModal}
              handleUpdatePageCategoryOrder={handleUpdatePageCategoryOrder}
            />
          )}

          {/* Page Category Order Modal */}
          <PageCategoryOrderModal
            isOpen={showPageCategoryOrderModal}
            onClose={() => setShowPageCategoryOrderModal(false)}
            categories={pageCategories}
            onUpdate={handleUpdatePageCategoryOrder}
          />

          {activeSection === 'Categories' && !isRestrictedAdmin && (
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

          {activeSection === 'Page Categories' && !isRestrictedAdmin && (
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

          {activeSection === 'Submitted Songs' && !isRestrictedAdmin && (
            <div className="h-full overflow-auto bg-gray-50">
              <SubmittedSongsPage embedded={true} />
            </div>
          )}
          {activeSection === 'Members' && !isRestrictedAdmin && <MembersSection />}
          {activeSection === 'Media' && !isRestrictedAdmin && <MediaSection />}
          {activeSection === 'Video Manager' && isHQAdmin && !isRestrictedAdmin && <MediaUploadSection />}
          {activeSection === 'Master Library' && !isRestrictedAdmin && <MasterLibrarySection isHQAdmin={isHQAdmin} />}
          {activeSection === 'Sub-Groups' && !isRestrictedAdmin && <SubGroupsSection />}
          {activeSection === 'Calendar' && !isRestrictedAdmin && <CalendarSection />}
          {activeSection === 'Notifications' && !isRestrictedAdmin && <SimpleNotificationsSection />}
          {activeSection === 'Activity Logs' && !isRestrictedAdmin && <ActivityLogsPage />}
          {activeSection === 'Support Chat' && isHQAdmin && !isRestrictedAdmin && <SupportChatSection />}
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

        <CategoryOrderModal
          isOpen={showCategoryOrderModal}
          onClose={() => setShowCategoryOrderModal(false)}
          praiseNight={selectedPage}
          songs={allSongs}
          onUpdate={handleUpdateCategoryOrder}
        />

        {/* Mobile Bottom Navigation */}
        <AdminMobileNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isRestrictedAdmin={isRestrictedAdmin}
          onMenuOpen={() => setIsSidebarOpen(true)}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AdminThemeProvider>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Initializing Admin Panel...</p>
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}

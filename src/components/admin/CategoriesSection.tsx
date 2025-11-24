"use client";

import React, { useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  FileText, 
  ShoppingCart, 
  Settings,
  Bookmark,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronDown,
  Edit,
  Trash2,
  Play,
  Pause,
  Music,
  Tag,
  X,
  Check,
  Save,
  ExternalLink,
  RefreshCw,
  Send,
  Users
} from "lucide-react";
import { Category, PraiseNightSong } from '../../types/supabase';
import { Toast } from '../Toast';
import { useAdminTheme } from './AdminThemeProvider';

interface CategoriesSectionProps {
  allCategories: Category[];
  allSongs: PraiseNightSong[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'heard' | 'unheard';
  setStatusFilter: (filter: 'all' | 'heard' | 'unheard') => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  showCategoryModal: boolean;
  setShowCategoryModal: (show: boolean) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  newPageCategoryName: string;
  setNewPageCategoryName: (name: string) => void;
  showDeleteCategoryDialog: boolean;
  setShowDeleteCategoryDialog: (show: boolean) => void;
  categoryToDelete: Category | null;
  setCategoryToDelete: (category: Category | null) => void;
  handleAddCategory: () => void;
  handleEditCategory: (categoryName: string) => void;
  handleUpdateCategory: () => void;
  handleDeleteCategory: (category: Category) => void;
  confirmDeleteCategory: () => void;
  cancelDeleteCategory: () => void;
  handleEditCategoryContent: (content: any) => void;
  handleDeleteCategoryContent: (id: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

export default function CategoriesSection(props: CategoriesSectionProps) {
  const { theme } = useAdminTheme();
  
  const {
    allCategories,
    allSongs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    showCategoryModal,
    setShowCategoryModal,
    editingCategory,
    setEditingCategory,
    newPageCategoryName,
    setNewPageCategoryName,
    showDeleteCategoryDialog,
    categoryToDelete,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    confirmDeleteCategory,
    cancelDeleteCategory,
    handleEditCategoryContent,
    handleDeleteCategoryContent,
    addToast
  } = props;

  // Helper function to check if a category is from the database
  const isDbCategory = (category: Category) => {
    // Categories from songs have IDs like "song-cat-{name}"
    return !category.id.toString().startsWith('song-cat-');
  };

  // Get all available categories from Supabase songs only
  const allAvailableCategories = useMemo(() => {
    console.log('🏷️ Computing available categories from songs...');
    
    if (!allSongs || allSongs.length === 0) {
      console.log('❌ No songs available for categories');
      return [];
    }
    
    // Get unique categories from songs
    const songCategories = [...new Set(allSongs.map(song => song.category))].filter(Boolean);
    console.log('🎵 Song categories found:', songCategories);
    
    // Convert to Category objects
    const categories: Category[] = songCategories.map((categoryName, index) => ({
      id: String(index + 1),
      name: categoryName,
      description: `Songs in ${categoryName} category`,
      icon: 'Music',
      color: '#3B82F6',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    console.log('📂 Available categories:', categories.length, categories);
    return categories;
  }, [allSongs]);

  // Combine database categories with song-based categories
  const combinedCategories = useMemo(() => {
    console.log('🔄 Combining categories...');
    console.log('📊 DB Categories:', allCategories?.length || 0);
    console.log('🎵 Song Categories:', allAvailableCategories.length);
    
    const combined = [...(allCategories || []), ...allAvailableCategories];
    
    // Remove duplicates based on name
    const uniqueCategories = combined.filter((category, index, self) => 
      index === self.findIndex(c => c.name === category.name)
    );
    
    console.log('✅ Combined unique categories:', uniqueCategories.length);
    return uniqueCategories;
  }, [allCategories, allAvailableCategories]);

  // Filter songs based on current filters FIRST
  const filteredSongs = useMemo(() => {
    let songs = allSongs;

    if (searchTerm) {
      songs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      songs = songs.filter(song => song.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      songs = songs.filter(song => song.category === categoryFilter);
    }

    return songs;
  }, [allSongs, searchTerm, statusFilter, categoryFilter]);

  // Get filtered songs for each category (respects all filters)
  const getCategorySongs = (categoryName: string) => {
    return filteredSongs.filter(song => song.category === categoryName);
  };

  // Filter categories based on search and whether they have songs after filtering
  const filteredCategories = useMemo(() => {
    let categories = combinedCategories;

    // Filter by category name search
    if (searchTerm) {
      categories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // If a specific category is selected in the filter, only show that category
    if (categoryFilter !== 'all') {
      categories = categories.filter(category => category.name === categoryFilter);
    }

    // If status filter is applied, only show categories that have songs with that status
    if (statusFilter !== 'all') {
      categories = categories.filter(category => {
        const categorySongs = allSongs.filter(song => song.category === category.name);
        return categorySongs.some(song => song.status === statusFilter);
      });
    }

    return categories;
  }, [combinedCategories, searchTerm, categoryFilter, statusFilter, allSongs]);

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 flex-1">Categories</h1>
            {filteredCategories.length > 0 && (
              <span className="text-sm text-slate-600">
                {filteredCategories.length}
              </span>
            )}
            <button
              onClick={() => {
                setEditingCategory(null);
                setNewPageCategoryName('');
                setShowCategoryModal(true);
              }}
              className={`flex items-center gap-2 px-3 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium text-sm`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 mb-4 space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'heard' | 'unheard')}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="heard">Heard</option>
                <option value="unheard">Unheard</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {combinedCategories.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>

              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium flex items-center gap-2"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="flex-1 overflow-auto">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-4">
            {filteredCategories.map((category) => {
              const categorySongs = getCategorySongs(category.name);
              const heardSongs = categorySongs.filter(song => song.status === 'heard').length;
              const unheardSongs = categorySongs.filter(song => song.status === 'unheard').length;
              const isFromDb = isDbCategory(category);

              return (
                <div
                  key={category.id}
                  className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                    isFromDb ? 'border-slate-200' : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isFromDb ? 'bg-purple-100' : 'bg-amber-100'
                      }`}>
                        <Tag className={`w-5 h-5 ${isFromDb ? theme.text : 'text-amber-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{category.name}</h3>
                          {!isFromDb && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              From Songs
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditCategory(category.name)}
                        className={`p-1.5 rounded ${
                          isFromDb
                            ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        disabled={!isFromDb}
                        title={!isFromDb ? 'Cannot edit song-based categories. Create in database first.' : 'Edit category'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className={`p-1.5 rounded ${
                          isFromDb
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        disabled={!isFromDb}
                        title={!isFromDb ? 'Cannot delete song-based categories' : 'Delete category'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Total Songs:</span>
                      <span className="font-medium text-slate-900">{categorySongs.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Heard:</span>
                      <span className="font-medium text-green-600">{heardSongs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Unheard:</span>
                      <span className="font-medium text-yellow-600">{unheardSongs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Category Songs Preview */}
                  {categorySongs.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Recent Songs</h4>
                      <div className="space-y-2">
                        {categorySongs.slice(0, 3).map((song, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 truncate">{song.title}</span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                song.status === 'heard' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {song.status}
                              </span>
                              <button
                                onClick={() => handleEditCategoryContent(song)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategoryContent(song.id?.toString() || '')}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {categorySongs.length > 3 && (
                          <div className="text-xs text-slate-500 text-center pt-2">
                            +{categorySongs.length - 3} more songs
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Categories Found</h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'No categories match your search.' : 'Get started by creating your first category.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewPageCategoryName('');
                  setShowCategoryModal(true);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium`}
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            )}
          </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

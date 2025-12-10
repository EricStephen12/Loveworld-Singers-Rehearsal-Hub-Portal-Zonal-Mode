'use client'

import { db } from '@/lib/firebase-setup'
import { 
  collection, 
  doc,
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'

export interface MediaCategory {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'media_categories'

// Default categories (used for initial setup)
export const DEFAULT_CATEGORIES: Omit<MediaCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Praise', slug: 'praise', order: 1 },
  { name: 'Worship', slug: 'worship', order: 2 },
  { name: 'Medley', slug: 'medley', order: 3 },
  { name: 'Healing', slug: 'healing', order: 4 },
  { name: 'GFAP', slug: 'gfap', order: 5 },
  { name: 'Live', slug: 'live', order: 6 },
  { name: 'Other', slug: 'other', order: 99 },
]

// Get all categories
export async function getCategories(): Promise<MediaCategory[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('order', 'asc'))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      // Initialize with default categories if none exist
      console.log('📁 No categories found, initializing defaults...')
      await initializeDefaultCategories()
      return getCategories()
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as MediaCategory[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return default categories as fallback
    return DEFAULT_CATEGORIES.map((cat, i) => ({
      ...cat,
      id: cat.slug,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  }
}

// Initialize default categories
export async function initializeDefaultCategories(): Promise<void> {
  try {
    for (const cat of DEFAULT_CATEGORIES) {
      await addDoc(collection(db, COLLECTION), {
        ...cat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    console.log('📁 Default categories initialized')
  } catch (error) {
    console.error('Error initializing categories:', error)
  }
}

// Create a new category
export async function createCategory(
  name: string,
  description?: string
): Promise<string> {
  try {
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Get max order
    const categories = await getCategories()
    const maxOrder = Math.max(...categories.map(c => c.order), 0)
    
    const docRef = await addDoc(collection(db, COLLECTION), {
      name,
      slug,
      description: description || '',
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('📁 Created category:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Update a category (and update all videos with old slug to new slug)
export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string; order?: number }
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, categoryId)
    
    // Get current category to check if slug is changing
    const currentDoc = await getDoc(docRef)
    const currentSlug = currentDoc.data()?.slug
    
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp()
    }
    
    // Calculate new slug if name changed
    let newSlug: string | null = null
    if (data.name) {
      newSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      updateData.slug = newSlug
    }
    
    // Update the category
    await updateDoc(docRef, updateData)
    console.log('📁 Updated category:', categoryId)
    
    // If slug changed, update all videos with the old slug
    if (newSlug && currentSlug && newSlug !== currentSlug) {
      console.log(`📁 Updating videos from "${currentSlug}" to "${newSlug}"...`)
      await updateVideosCategory(currentSlug, newSlug)
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Update all videos from old category slug to new slug
async function updateVideosCategory(oldSlug: string, newSlug: string): Promise<number> {
  try {
    const videosRef = collection(db, 'media_videos')
    const q = query(videosRef, where('type', '==', oldSlug))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      console.log(`📁 No videos found with category "${oldSlug}"`)
      return 0
    }
    
    // Use batch writes for efficiency (max 500 per batch)
    const batchSize = 500
    let updatedCount = 0
    
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db)
      const chunk = snapshot.docs.slice(i, i + batchSize)
      
      chunk.forEach(docSnap => {
        batch.update(docSnap.ref, { 
          type: newSlug,
          updatedAt: serverTimestamp()
        })
      })
      
      await batch.commit()
      updatedCount += chunk.length
    }
    
    console.log(`📁 Updated ${updatedCount} videos from "${oldSlug}" to "${newSlug}"`)
    return updatedCount
  } catch (error) {
    console.error('Error updating videos category:', error)
    throw error
  }
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, categoryId))
    console.log('📁 Deleted category:', categoryId)
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

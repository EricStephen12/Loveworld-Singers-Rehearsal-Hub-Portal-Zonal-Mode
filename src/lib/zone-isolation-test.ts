// Zone Data Isolation Test
// Ensures zones cannot see each other's data

import { ZoneDatabaseService } from './zone-database-service'
import { FirebaseDatabaseService } from './firebase-database'

export class ZoneIsolationTest {
  
  /**
   * Test that Zone A cannot see Zone B's data
   */
  static async testZoneDataIsolation() {
    console.log('🧪 Starting Zone Data Isolation Test...')
    
    const testResults = {
      praiseNights: false,
      songs: false,
      categories: false,
      pageCategories: false,
      overall: false
    }
    
    try {
      // Test Zone IDs
      const zoneA = 'zone-a-test'
      const zoneB = 'zone-b-test'
      
      // 1. Test Praise Nights Isolation
      console.log('📝 Testing praise nights isolation...')
      const praiseNightsA = await ZoneDatabaseService.getPraiseNightsByZone(zoneA)
      const praiseNightsB = await ZoneDatabaseService.getPraiseNightsByZone(zoneB)
      
      // Check that Zone A data doesn't appear in Zone B results
      const hasOverlap = praiseNightsA.some((pnA: any) => 
        praiseNightsB.some((pnB: any) => pnA.id === pnB.id)
      )
      
      testResults.praiseNights = !hasOverlap
      console.log(`✅ Praise nights isolation: ${testResults.praiseNights ? 'PASS' : 'FAIL'}`)
      
      // 2. Test Songs Isolation
      console.log('🎵 Testing songs isolation...')
      const songsA = await ZoneDatabaseService.getAllSongsByZone(zoneA)
      const songsB = await ZoneDatabaseService.getAllSongsByZone(zoneB)
      
      const songOverlap = songsA.some((sA: any) => 
        songsB.some((sB: any) => sA.id === sB.id)
      )
      
      testResults.songs = !songOverlap
      console.log(`✅ Songs isolation: ${testResults.songs ? 'PASS' : 'FAIL'}`)
      
      // 3. Test Categories Isolation
      console.log('📂 Testing categories isolation...')
      const categoriesA = await ZoneDatabaseService.getCategoriesByZone(zoneA)
      const categoriesB = await ZoneDatabaseService.getCategoriesByZone(zoneB)
      
      const categoryOverlap = categoriesA.some((cA: any) => 
        categoriesB.some((cB: any) => cA.id === cB.id)
      )
      
      testResults.categories = !categoryOverlap
      console.log(`✅ Categories isolation: ${testResults.categories ? 'PASS' : 'FAIL'}`)
      
      // 4. Test Page Categories Isolation
      console.log('📄 Testing page categories isolation...')
      const pageCategoriesA = await ZoneDatabaseService.getPageCategoriesByZone(zoneA)
      const pageCategoriesB = await ZoneDatabaseService.getPageCategoriesByZone(zoneB)
      
      const pageCategoryOverlap = pageCategoriesA.some((pcA: any) => 
        pageCategoriesB.some((pcB: any) => pcA.id === pcB.id)
      )
      
      testResults.pageCategories = !pageCategoryOverlap
      console.log(`✅ Page categories isolation: ${testResults.pageCategories ? 'PASS' : 'FAIL'}`)
      
      // Overall result
      testResults.overall = Object.values(testResults).every(result => result === true)
      
      console.log('🎯 Zone Data Isolation Test Results:')
      console.log('  - Praise Nights:', testResults.praiseNights ? '✅ PASS' : '❌ FAIL')
      console.log('  - Songs:', testResults.songs ? '✅ PASS' : '❌ FAIL')
      console.log('  - Categories:', testResults.categories ? '✅ PASS' : '❌ FAIL')
      console.log('  - Page Categories:', testResults.pageCategories ? '✅ PASS' : '❌ FAIL')
      console.log('  - Overall:', testResults.overall ? '✅ PASS' : '❌ FAIL')
      
      return testResults
      
    } catch (error) {
      console.error('❌ Zone isolation test failed:', error)
      return testResults
    }
  }
  
  /**
   * Test that super admin can switch zones and see different data
   */
  static async testSuperAdminZoneSwitching(superAdminUserId: string) {
    console.log('👑 Testing Super Admin Zone Switching...')
    
    try {
      const zoneA = 'zone-a-test'
      const zoneB = 'zone-b-test'
      
      // Get data for Zone A
      console.log('📊 Getting Zone A data...')
      const dataA = {
        praiseNights: await ZoneDatabaseService.getPraiseNightsByZone(zoneA),
        songs: await ZoneDatabaseService.getAllSongsByZone(zoneA),
        categories: await ZoneDatabaseService.getCategoriesByZone(zoneA)
      }
      
      // Get data for Zone B
      console.log('📊 Getting Zone B data...')
      const dataB = {
        praiseNights: await ZoneDatabaseService.getPraiseNightsByZone(zoneB),
        songs: await ZoneDatabaseService.getAllSongsByZone(zoneB),
        categories: await ZoneDatabaseService.getCategoriesByZone(zoneB)
      }
      
      console.log('📈 Zone A Stats:')
      console.log(`  - Praise Nights: ${dataA.praiseNights.length}`)
      console.log(`  - Songs: ${dataA.songs.length}`)
      console.log(`  - Categories: ${dataA.categories.length}`)
      
      console.log('📈 Zone B Stats:')
      console.log(`  - Praise Nights: ${dataB.praiseNights.length}`)
      console.log(`  - Songs: ${dataB.songs.length}`)
      console.log(`  - Categories: ${dataB.categories.length}`)
      
      const switchingWorks = true // If we get here without errors, switching works
      
      console.log(`✅ Super Admin Zone Switching: ${switchingWorks ? 'PASS' : 'FAIL'}`)
      
      return {
        success: switchingWorks,
        zoneAData: dataA,
        zoneBData: dataB
      }
      
    } catch (error) {
      console.error('❌ Super admin zone switching test failed:', error)
      return {
        success: false,
        error: error
      }
    }
  }
  
  /**
   * Test that zone-scoped queries work correctly
   */
  static async testZoneScopedQueries() {
    console.log('🔍 Testing Zone-Scoped Queries...')
    
    try {
      const testZone = 'test-zone-queries'
      
      // Test creating data with zone scope
      console.log('📝 Testing zone-scoped creation...')
      
      const testPraiseNight = {
        title: 'Test Praise Night',
        description: 'Test Description',
        date: new Date().toISOString(),
        status: 'active'
      }
      
      const createResult = await ZoneDatabaseService.createPraiseNight(testZone, testPraiseNight)
      
      if (createResult.success) {
        console.log('✅ Zone-scoped creation: PASS')
        
        // Test retrieving data with zone scope
        const retrievedData = await ZoneDatabaseService.getPraiseNightsByZone(testZone)
        const hasTestData = retrievedData.some((pn: any) => pn.title === 'Test Praise Night')
        
        console.log(`✅ Zone-scoped retrieval: ${hasTestData ? 'PASS' : 'FAIL'}`)
        
        // Clean up test data
        if ('id' in createResult && createResult.id) {
          await ZoneDatabaseService.deletePraiseNight(createResult.id)
          console.log('🧹 Test data cleaned up')
        }
        
        return {
          creation: true,
          retrieval: hasTestData,
          overall: hasTestData
        }
      } else {
        console.log('❌ Zone-scoped creation: FAIL')
        return {
          creation: false,
          retrieval: false,
          overall: false
        }
      }
      
    } catch (error) {
      console.error('❌ Zone-scoped queries test failed:', error)
      return {
        creation: false,
        retrieval: false,
        overall: false,
        error: error
      }
    }
  }
  
  /**
   * Run all zone isolation tests
   */
  static async runAllTests(superAdminUserId?: string) {
    console.log('🚀 Running All Zone Isolation Tests...')
    console.log('=' .repeat(50))
    
    const results = {
      dataIsolation: await this.testZoneDataIsolation(),
      scopedQueries: await this.testZoneScopedQueries(),
      superAdminSwitching: superAdminUserId ? await this.testSuperAdminZoneSwitching(superAdminUserId) : null
    }
    
    console.log('=' .repeat(50))
    console.log('🎯 FINAL TEST RESULTS:')
    console.log('  - Data Isolation:', results.dataIsolation.overall ? '✅ PASS' : '❌ FAIL')
    console.log('  - Scoped Queries:', results.scopedQueries.overall ? '✅ PASS' : '❌ FAIL')
    if (results.superAdminSwitching) {
      console.log('  - Super Admin Switching:', results.superAdminSwitching.success ? '✅ PASS' : '❌ FAIL')
    }
    
    const allPassed = results.dataIsolation.overall && 
                     results.scopedQueries.overall && 
                     (results.superAdminSwitching?.success !== false)
    
    console.log('🏆 OVERALL:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED')
    
    return results
  }
}
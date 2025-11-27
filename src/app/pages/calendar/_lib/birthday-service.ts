import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { UserProfile } from '@/types/supabase'
import moment from 'moment'

export interface BirthdayUser {
  id: string
  first_name: string
  last_name: string
  birthday: string
  profile_image_url?: string
  age?: number
  isToday: boolean
}

export class BirthdayService {
  /**
   * Get users with birthdays today and upcoming (next 7 days)
   */
  static async getTodayAndUpcomingBirthdays(): Promise<BirthdayUser[]> {
    try {
      // Get all profiles with birthdays
      const profiles = await FirebaseDatabaseService.getCollection('profiles') as unknown as UserProfile[]
      
      if (!profiles || profiles.length === 0) {
        return []
      }

      const today = moment()
      const nextWeek = moment().add(7, 'days')
      
      const birthdayUsers: BirthdayUser[] = profiles
        .filter(profile => profile.birthday) // Only users with birthdays
        .map(profile => {
          const birthday = moment(profile.birthday)
          
          // Get birthday this year
          const birthdayThisYear = moment(profile.birthday).year(today.year())
          
          // Check if birthday is today
          const isToday = birthdayThisYear.isSame(today, 'day')
          
          // Check if birthday is within next 7 days
          const isUpcoming = birthdayThisYear.isBetween(today, nextWeek, 'day', '[]')
          
          if (!isToday && !isUpcoming) {
            return null
          }

          // Calculate age
          const age = today.year() - birthday.year()

          return {
            id: profile.id,
            first_name: profile.first_name || 'Unknown',
            last_name: profile.last_name || '',
            birthday: profile.birthday,
            profile_image_url: profile.profile_image_url,
            age,
            isToday
          }
        })
        .filter(Boolean) as BirthdayUser[]

      // Sort: today's birthdays first, then by date
      return birthdayUsers.sort((a, b) => {
        if (a.isToday && !b.isToday) return -1
        if (!a.isToday && b.isToday) return 1
        
        const dateA = moment(a.birthday).month() * 100 + moment(a.birthday).date()
        const dateB = moment(b.birthday).month() * 100 + moment(b.birthday).date()
        return dateA - dateB
      })
    } catch (error) {
      console.error('Error fetching birthdays:', error)
      return []
    }
  }

  /**
   * Get only today's birthdays
   */
  static async getTodaysBirthdays(): Promise<BirthdayUser[]> {
    const allBirthdays = await this.getTodayAndUpcomingBirthdays()
    return allBirthdays.filter(user => user.isToday)
  }
}

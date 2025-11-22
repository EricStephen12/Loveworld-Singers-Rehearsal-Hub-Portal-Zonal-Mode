import { FirebaseDatabaseService } from './firebase-database'

export const createSampleGroups = async () => {
  try {
    // Create sample groups
    const sampleGroups = [
      {
        id: 'yourloveworldsingers',
        name: 'Your LoveWorld Singers',
        description: 'Main group for LoveWorld Singers members',
        members: [
          {
            id: '1',
            user_id: 'WwfMKnHxOCVoqqo28YIJDRAzZt83',
            first_name: 'Eric',
            last_name: 'Stephen',
            profile_image_url: 'https://dumhphyhvnyyqnmnahno.supabase.co/storage/v1/object/public/media-files/profile-images/WwfMKnHxOCVoqqo28YIJDRAzZt83-1759538635251-o2kjrj.webp',
            designation: 'Instrumentalist',
            administration: 'Member',
            is_admin: true
          }
        ],
        unread_count: 0,
        last_message: 'Welcome to the group!',
        last_message_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        group_image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center'
      },
      {
        id: 'instrumentalists',
        name: 'Instrumentalists',
        description: 'Group for instrumentalists and musicians',
        members: [
          {
            id: '1',
            user_id: 'WwfMKnHxOCVoqqo28YIJDRAzZt83',
            first_name: 'Eric',
            last_name: 'Stephen',
            profile_image_url: 'https://dumhphyhvnyyqnmnahno.supabase.co/storage/v1/object/public/media-files/profile-images/WwfMKnHxOCVoqqo28YIJDRAzZt83-1759538635251-o2kjrj.webp',
            designation: 'Instrumentalist',
            administration: 'Member',
            is_admin: false
          }
        ],
        unread_count: 2,
        last_message: 'New song practice session tomorrow',
        last_message_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        group_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center'
      },
      {
        id: 'region-a',
        name: 'Region A Members',
        description: 'Group for Region A members',
        members: [
          {
            id: '1',
            user_id: 'WwfMKnHxOCVoqqo28YIJDRAzZt83',
            first_name: 'Eric',
            last_name: 'Stephen',
            profile_image_url: 'https://dumhphyhvnyyqnmnahno.supabase.co/storage/v1/object/public/media-files/profile-images/WwfMKnHxOCVoqqo28YIJDRAzZt83-1759538635251-o2kjrj.webp',
            designation: 'Instrumentalist',
            administration: 'Member',
            is_admin: false
          }
        ],
        unread_count: 1,
        last_message: 'Regional meeting this weekend',
        last_message_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        group_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=center'
      }
    ]

    // Add groups to Firebase
    for (const group of sampleGroups) {
      await FirebaseDatabaseService.createDocument('groups', group.id, group)
      console.log(`Created group: ${group.name}`)
    }

    console.log('Sample groups created successfully!')
    return true
  } catch (error) {
    console.error('Error creating sample groups:', error)
    return false
  }
}


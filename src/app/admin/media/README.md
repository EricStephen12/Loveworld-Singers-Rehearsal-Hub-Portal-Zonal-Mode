# Admin Media Upload

Admin-only section for uploading media content to the platform.

## Location

`/admin/media` - Accessible from Admin Sidebar → "Media Upload"

## Features

- Upload videos via Cloudinary
- Upload thumbnails and backdrop images
- Set media metadata (title, description, type, year)
- Mark content as featured
- Real-time upload progress tracking

## How It Works

1. **Video Upload**: Uses Cloudinary widget to upload videos to cloud storage
2. **Metadata Storage**: Saves video URL and metadata to Firebase Firestore
3. **Display**: Media appears in `/pages/media` for all users

## Upload Process

1. Fill in media title and description
2. Select media type (Sermon, Worship, Teaching, etc.)
3. Click "Upload Video" → Cloudinary widget opens
4. Select video file (max 500MB)
5. Click "Upload Thumbnail" → Upload thumbnail image (max 10MB)
6. Optionally upload backdrop image
7. Check "Mark as Featured" if needed
8. Click "Upload Media"

## Cloudinary Configuration

Requires these environment variables:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## File Structure

```
admin/media/
├── page.tsx       # Upload interface
├── layout.tsx     # Loads Cloudinary script
└── README.md      # This file
```

## Storage Structure

### Cloudinary
- Videos: `media/videos/`
- Images: `media/images/`

### Firebase Firestore
- Collection: `media_items`
- Fields: title, description, videoUrl, thumbnail, type, genre, etc.

## Access Control

- Only accessible to admin users
- Requires authentication
- Redirects non-admin users

## Future Enhancements

- Bulk upload support
- Video editing/trimming
- Automatic thumbnail generation
- Upload queue management
- Media library browser

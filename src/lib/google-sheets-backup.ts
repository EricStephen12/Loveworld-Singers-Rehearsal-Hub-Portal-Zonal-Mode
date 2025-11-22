// Google Sheets Auto-Backup Service
// This requires Google Sheets API setup

interface GoogleSheetsConfig {
  spreadsheetId: string
  apiKey: string
  range: string
}

export class GoogleSheetsBackup {
  private static config: GoogleSheetsConfig = {
    spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || '',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
    range: 'Sheet1!A1:Z1000'
  }

  // Setup instructions for Google Sheets API
  static getSetupInstructions(): string {
    return `
🔧 GOOGLE SHEETS AUTO-BACKUP SETUP:

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Create a Google Sheet for backups
6. Add these to your .env.local file:

NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here

7. Share your Google Sheet with "Anyone with the link can edit"

📋 ALTERNATIVE SIMPLE SETUP:

1. Create a Google Sheet
2. Use Google Apps Script to create a webhook
3. Send data via HTTP POST to the webhook
4. No API keys needed!

Example Apps Script code:
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), JSON.stringify(data)]);
  return ContentService.createTextOutput('Success');
}
    `
  }

  // Simple webhook-based backup (no API key needed)
  static async backupViaWebhook(data: any, webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: data,
          source: 'LoveWorld Singers App'
        })
      })

      if (response.ok) {
        console.log('✅ Data sent to Google Sheets successfully')
        return true
      } else {
        console.error('❌ Failed to send data to Google Sheets:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('❌ Webhook backup failed:', error)
      return false
    }
  }

  // Create a simple backup URL for manual setup
  static generateBackupURL(data: any): string {
    const encodedData = encodeURIComponent(JSON.stringify(data))
    const googleFormsUrl = `https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse?entry.123456789=${encodedData}`

    return googleFormsUrl
  }

  // Generate CSV for Google Sheets import
  static generateGoogleSheetsCSV(data: any[]): string {
    if (data.length === 0) return ''

    // Get all unique keys
    const allKeys = new Set<string>()
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    const headers = Array.from(allKeys)
    const csvRows = [headers.join(',')]

    // Convert each record to CSV row
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  // Create Google Sheets import instructions
  static getImportInstructions(): string {
    return `
📊 HOW TO IMPORT BACKUP TO GOOGLE SHEETS:

METHOD 1 - Direct Import:
1. Download the CSV backup file
2. Open Google Sheets (sheets.google.com)
3. Create a new spreadsheet
4. Go to File > Import
5. Upload your CSV file
6. Choose "Replace spreadsheet" or "Insert new sheet"
7. Click "Import data"

METHOD 2 - Copy & Paste:
1. Download JSON backup
2. Open the JSON file in a text editor
3. Copy the data you need
4. Paste into Google Sheets
5. Use Data > Split text to columns if needed

METHOD 3 - Google Apps Script (Advanced):
1. Open Google Sheets
2. Go to Extensions > Apps Script
3. Paste the webhook code provided
4. Deploy as web app
5. Use the webhook URL for auto-backup

🔄 AUTO-SYNC SETUP:
1. Set up Google Apps Script webhook
2. Add webhook URL to app settings
3. Enable auto-backup in the app
4. Data will sync automatically every 24 hours
    `
  }

  // Test Google Sheets connection
  static async testConnection(webhookUrl?: string): Promise<boolean> {
    if (!webhookUrl) {
      console.log('ℹ️ No webhook URL provided for testing')
      return false
    }

    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'LoveWorld Singers backup test'
      }

      const success = await this.backupViaWebhook(testData, webhookUrl)
      return success
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
  }

  // Schedule automatic backups
  static scheduleAutoBackup(webhookUrl: string, intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000

    setInterval(async () => {
      try {
        console.log('🔄 Running scheduled Google Sheets backup...')

        // Get data from your backup service
        const { BackupService } = await import('./backup-service')
        const jsonData = await BackupService.exportToJSON()
        const data = JSON.parse(jsonData)

        const success = await this.backupViaWebhook(data, webhookUrl)

        if (success) {
          console.log('✅ Scheduled Google Sheets backup completed')
          localStorage.setItem('lastGoogleSheetsBackup', new Date().toISOString())
        } else {
          console.error('❌ Scheduled Google Sheets backup failed')
        }
      } catch (error) {
        console.error('❌ Scheduled backup error:', error)
      }
    }, intervalMs)

    console.log(`✅ Google Sheets auto-backup scheduled every ${intervalHours} hours`)
  }
}
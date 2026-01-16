# Remove all redundant auth redirects from pages
# PageLoader already handles auth, so individual pages don't need to redirect to /auth

$files = @(
    "src\app\pages\groups\page.tsx",
    "src\app\pages\media\playlists\page.tsx",
    "src\app\pages\media\playlists\admin\[id]\page.tsx",
    "src\app\pages\media\playlists\[id]\page.tsx",
    "src\app\pages\media\player\[id]\page.tsx"
)

$count = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file | Out-String
        $originalContent = $content
        
        # Remove useEffect blocks that redirect to /auth
        # Pattern 1: Simple redirect check
        $content = $content -replace "(?s)useEffect\(\(\) => \{\s*if \(!user\) \{\s*router\.push\('/auth'\)\s*\}\s*\}, \[user, router\]\)", ""
        
        # Pattern 2: With loading check
        $content = $content -replace "(?s)useEffect\(\(\) => \{\s*if \(!.*?Loading && !user\) \{\s*router\.push\('/auth'\)\s*\}\s*\}, \[.*?\]\)", ""
        
        # Pattern 3: Inline button redirects (keep these - they're UI elements)
        # Don't remove: onClick={() => router.push('/auth')}
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content
            Write-Host "✓ Cleaned $file" -ForegroundColor Green
            $count++
        }
    }
}

Write-Host "`nRemoved redundant auth checks from $count files" -ForegroundColor Cyan

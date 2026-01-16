# Codebase Cleanup Script - Simple Version
# Removes AI-generated patterns from TypeScript files

$srcPath = "src"
$backupPath = "cleanup_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "Starting codebase cleanup..." -ForegroundColor Cyan
Write-Host "Creating backup at: $backupPath" -ForegroundColor Yellow

# Create backup
Copy-Item -Path $srcPath -Destination $backupPath -Recurse

# Get all TypeScript files
$files = Get-ChildItem -Path $srcPath -Include "*.ts","*.tsx" -Recurse

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    $processedFiles++
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Remove Step comments
    $content = $content -replace '//\s*Step\s+\d+:.*\r?\n', ''
    
    # Remove FIXED comments
    $content = $content -replace '//\s*FIXED:.*\r?\n', ''
    
    # Remove TODO comments  
    $content = $content -replace '//\s*TODO:.*\r?\n', ''
    
    # Remove NOTE comments
    $content = $content -replace '//\s*NOTE:.*\r?\n', ''
    
    # Remove obvious Get/Set/Update/Clear comments
    $content = $content -replace '//\s*Get\s+\w+\s+from\s+.*\r?\n', ''
    $content = $content -replace '//\s*Set\s+\w+\s+to\s+.*\r?\n', ''
    $content = $content -replace '//\s*Update\s+\w+.*\r?\n', ''
    $content = $content -replace '//\s*Clear\s+\w+.*\r?\n', ''
    $content = $content -replace '//\s*Check\s+if\s+.*\r?\n', ''
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        $modifiedFiles++
    }
    
    if ($processedFiles % 50 -eq 0) {
        Write-Host "Progress: $processedFiles/$totalFiles files processed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Cyan
Write-Host "Backup location: $backupPath" -ForegroundColor Yellow

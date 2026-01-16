# Console.log Cleanup Script
# Removes debug console.log statements while keeping errors and warnings

$srcPath = "src"

Write-Host "Starting console.log cleanup..." -ForegroundColor Cyan

# Get all TypeScript files
$files = Get-ChildItem -Path $srcPath -Include "*.ts", "*.tsx" -Recurse

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0
$totalLogsRemoved = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    $processedFiles++
    $lines = Get-Content $file.FullName -Encoding UTF8
    $newLines = @()
    $fileModified = $false
    $logsRemovedInFile = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Skip lines with console.log (but keep console.error and console.warn)
        if ($line -match '^\s*console\.log\(' -and 
            $line -notmatch 'console\.error' -and 
            $line -notmatch 'console\.warn') {
            
            # Check if it's a multi-line console.log
            $skipNext = $false
            if ($line -notmatch '\)\s*;?\s*$') {
                # Multi-line console.log - skip until we find the closing )
                $skipNext = $true
                while ($i -lt $lines.Count - 1) {
                    $i++
                    if ($lines[$i] -match '\)\s*;?\s*$') {
                        break
                    }
                }
            }
            
            $fileModified = $true
            $logsRemovedInFile++
            continue
        }
        
        $newLines += $line
    }
    
    if ($fileModified) {
        Set-Content -Path $file.FullName -Value $newLines -Encoding UTF8
        $modifiedFiles++
        $totalLogsRemoved += $logsRemovedInFile
    }
    
    if ($processedFiles % 50 -eq 0) {
        Write-Host "Progress: $processedFiles/$totalFiles files processed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Console.log cleanup complete!" -ForegroundColor Green
Write-Host "Files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files modified: $modifiedFiles" -ForegroundColor Cyan
Write-Host "Console.logs removed: $totalLogsRemoved" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: console.error and console.warn were preserved" -ForegroundColor Yellow

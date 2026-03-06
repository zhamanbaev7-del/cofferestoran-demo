param(
  [string]$RepoPath = ".",
  [int]$DebounceSeconds = 3,
  [string]$Branch = "main",
  [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"

Set-Location $RepoPath

function Write-Log([string]$msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "[$ts] $msg"
}

function In-GitRepo {
  try {
    git rev-parse --is-inside-work-tree *> $null
    return $true
  } catch {
    return $false
  }
}

if (-not (In-GitRepo)) {
  throw "Текущая папка не является git-репозиторием: $RepoPath"
}

# Защита от параллельного запуска
$lockFile = Join-Path (Get-Location) ".autosync.lock"
if (Test-Path $lockFile) {
  Write-Log "Auto-sync уже запущен (есть .autosync.lock)."
  exit 0
}
New-Item -ItemType File -Path $lockFile -Force | Out-Null

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = (Get-Location).Path
$watcher.IncludeSubdirectories = $true
$watcher.Filter = "*.*"
$watcher.NotifyFilter = [IO.NotifyFilters]'FileName, LastWrite, DirectoryName, Size'
$watcher.EnableRaisingEvents = $true

# Список исключений
$ignoreDirs = @(".git", "node_modules", ".next", "dist", "build", ".vscode")
$ignoreFiles = @(".autosync.lock")

$script:dirty = $false
$script:lastEvent = Get-Date
$script:syncInProgress = $false

$onChange = {
  param($sender, $eventArgs)

  $fullPath = $eventArgs.FullPath
  $relPath = [IO.Path]::GetRelativePath((Get-Location).Path, $fullPath)

  foreach ($d in $ignoreDirs) {
    if ($relPath -like "$d*" -or $relPath -like "*$([IO.Path]::DirectorySeparatorChar)$d$([IO.Path]::DirectorySeparatorChar)*") {
      return
    }
  }

  foreach ($f in $ignoreFiles) {
    if ($relPath -eq $f) { return }
  }

  $script:dirty = $true
  $script:lastEvent = Get-Date
}

$subs = @(
  Register-ObjectEvent $watcher Changed -Action $onChange,
  Register-ObjectEvent $watcher Created -Action $onChange,
  Register-ObjectEvent $watcher Deleted -Action $onChange,
  Register-ObjectEvent $watcher Renamed -Action $onChange
)

Write-Log "Auto Git Sync запущен. Отслеживание изменений в: $((Get-Location).Path)"
Write-Log "Debounce: $DebounceSeconds сек. Branch: $Branch Remote: $Remote"

try {
  while ($true) {
    Start-Sleep -Seconds 1

    if (-not $script:dirty -or $script:syncInProgress) { continue }

    $idleFor = (Get-Date) - $script:lastEvent
    if ($idleFor.TotalSeconds -lt $DebounceSeconds) { continue }

    $script:syncInProgress = $true
    try {
      git add -A

      # commit only when there are staged changes
      git diff --cached --quiet
      if ($LASTEXITCODE -eq 0) {
        $script:dirty = $false
        continue
      }

      $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      $msg = "Auto-save: $stamp"
      git commit -m $msg | Out-Host

      # push latest state
      git push $Remote $Branch | Out-Host
      Write-Log "Изменения автоматически сохранены и отправлены в $Remote/$Branch"

      $script:dirty = $false
    } catch {
      Write-Log "Ошибка авто-синхронизации: $($_.Exception.Message)"
      # оставляем dirty=true, чтобы повторить попытку после следующих изменений
    } finally {
      $script:syncInProgress = $false
    }
  }
}
finally {
  foreach ($s in $subs) {
    if ($s) { Unregister-Event -SourceIdentifier $s.Name -ErrorAction SilentlyContinue }
  }
  $watcher.Dispose()
  Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
  Write-Log "Auto Git Sync остановлен"
}

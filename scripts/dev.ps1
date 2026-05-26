$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $root "restaurant-backend"
$frontendDir = Join-Path $root "restaurant-frontend"
$processes = @()

function Start-AppProcess {
  param(
    [string]$Name,
    [string]$WorkingDirectory
  )

  $process = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory $WorkingDirectory `
    -NoNewWindow `
    -PassThru

  Write-Host "Started $Name (PID $($process.Id))"

  return [PSCustomObject]@{
    Name = $Name
    Process = $process
  }
}

try {
  $processes += Start-AppProcess -Name "backend" -WorkingDirectory $backendDir
  $processes += Start-AppProcess -Name "frontend" -WorkingDirectory $frontendDir

  Write-Host ""
  Write-Host "Backend:  http://localhost:5000"
  Write-Host "Frontend: http://localhost:5173"
  Write-Host "Press Ctrl+C to stop both."
  Write-Host ""

  while ($true) {
    foreach ($item in $processes) {
      if ($item.Process.HasExited) {
        throw "$($item.Name) stopped with exit code $($item.Process.ExitCode)."
      }
    }
    Start-Sleep -Seconds 1
  }
}
finally {
  foreach ($item in $processes) {
    if (-not $item.Process.HasExited) {
      Write-Host "Stopping $($item.Name)..."
      try {
        Stop-Process -Id $item.Process.Id -Force -ErrorAction Stop
      }
      catch {
        Write-Warning "Could not stop $($item.Name): $($_.Exception.Message)"
      }
    }
  }
}

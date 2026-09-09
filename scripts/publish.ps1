# Run in the ordinary Windows user session so gh can use the user's Credential Manager.
# Publishes only this project. No tokens are exported or stored in project files.
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $projectRoot
# Trust only this explicitly selected project for this process. Files may have
# been created by the isolated Codex Windows user; do not change global Git trust.
$gitConfigIndex = if ($env:GIT_CONFIG_COUNT) { [int]$env:GIT_CONFIG_COUNT } else { 0 }
[Environment]::SetEnvironmentVariable("GIT_CONFIG_KEY_$gitConfigIndex", 'safe.directory', 'Process')
[Environment]::SetEnvironmentVariable("GIT_CONFIG_VALUE_$gitConfigIndex", $projectRoot, 'Process')
$env:GIT_CONFIG_COUNT = [string]($gitConfigIndex + 1)
function Check-Last([string]$Step) { if ($LASTEXITCODE -ne 0) { throw "$Step ist fehlgeschlagen. Es wurde nichts erzwungen oder ueberschrieben." } }
try {
  $login = & gh api user --jq '.login'
  Check-Last 'GitHub-Anmeldung'
  if ($login -ne 'Blueforcer') { throw "Angemeldet als $login. Dieses Projekt ist fuer Blueforcer vorbereitet. Bitte zuerst das passende Konto aktivieren." }
  & node --test 'tests/*.test.js'
  Check-Last 'Aufgabentests'
  $repository = 'Blueforcer/matheabenteuer'
  if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.git'))) { throw 'Das vorbereitete lokale Git-Repository fehlt.' }
  $changes = & git status --porcelain
  Check-Last 'Git-Pruefung'
  if ($changes) { throw 'Es gibt ungesicherte Aenderungen. Bitte vor der Veroeffentlichung pruefen und committen.' }
  $remote = & git config --get remote.origin.url
  if ($remote) {
    if ($remote -notin @('https://github.com/Blueforcer/matheabenteuer.git', 'git@github.com:Blueforcer/matheabenteuer.git')) { throw 'Ein anderes Origin-Repository ist eingetragen. Abbruch.' }
    & git push origin main
    Check-Last 'Git-Upload'
  } else {
    & gh repo create $repository --public --description 'Matheabenteuer mit Fine: Mathe fuer Klasse 2 und 3, mit Hessen-Bezug, Uebungen und Spielmuenzen.' --source $projectRoot --remote origin --push
    Check-Last 'Oeffentliches Repository erstellen'
  }
  $ErrorActionPreference = 'Continue'
  $pages = & gh api "repos/$repository/pages" 2>$null
  $pagesExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($pagesExitCode -eq 0) {
    & gh api "repos/$repository/pages" --method PUT -f 'build_type=legacy' -f 'source[branch]=main' -f 'source[path]=/'
  } else {
    & gh api "repos/$repository/pages" --method POST -f 'build_type=legacy' -f 'source[branch]=main' -f 'source[path]=/'
  }
  Check-Last 'GitHub Pages aktivieren'
  & gh repo edit $repository --homepage 'https://blueforcer.github.io/matheabenteuer/'
  Check-Last 'Website-Link setzen'
  Write-Host ''
  Write-Host 'Repository: https://github.com/Blueforcer/matheabenteuer' -ForegroundColor Green
  Write-Host 'Website nach GitHub-Bereitstellung: https://blueforcer.github.io/matheabenteuer/' -ForegroundColor Green
  Write-Host 'Die Bereitstellung kann einige Minuten dauern.'
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}

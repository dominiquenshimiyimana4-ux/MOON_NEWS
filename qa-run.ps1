param(
  [string]$Base = "http://localhost:3200",
  [string]$Path = "/login",
  [string]$Only = "",
  [string]$AdminVisit = "",
  [string]$Out = "qa-roles-out.txt",
  [int]$Wait = 420
)
$env:QA_BASE = $Base
$env:QA_ONLY = $Only
$env:QA_ADMIN_VISIT = $AdminVisit
$node = "C:\Program Files\nodejs\node.exe"
$browser = "C:\Users\domin\.codegpt\skills\browser-automation\browser.mjs"
$p = Start-Process -FilePath $node -ArgumentList $browser, "$Base$Path", "--script", "qa-roles.mjs", "--timeout", "120000" -RedirectStandardOutput $Out -RedirectStandardError "$Out.err" -WindowStyle Hidden -PassThru
$deadline = (Get-Date).AddSeconds($Wait)
while (-not $p.HasExited -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 3 }
if (-not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; "TIMEOUT" }
Get-Content $Out -Tail 90

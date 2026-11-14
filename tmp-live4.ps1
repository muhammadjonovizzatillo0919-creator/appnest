$ErrorActionPreference = "Continue"
$base = "https://appnest-mir07.vercel.app"
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Output "Deploy kutilmoqda..."
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 20
  try {
    $h = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 30
    Write-Output ("  health ok=" + $h.ok + " | db: " + $h.checks.database.detail)
    break
  } catch { }
}

Write-Output ""
Write-Output "=== 1) RO'YXATDAN O'TISH + LOGIN ==="
try {
  $reg = Invoke-RestMethod -Uri "$base/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@appnest.uz","password":"parol12345"}' -TimeoutSec 40
  Write-Output ("  register: OK (" + $reg.user.email + ")")
} catch {
  Write-Output ("  register: " + $_.Exception.Response.StatusCode.value__)
}
try {
  Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@appnest.uz","password":"parol12345"}' -WebSession $s -TimeoutSec 40 | Out-Null
  $sess = Invoke-RestMethod -Uri "$base/api/auth/session" -WebSession $s -TimeoutSec 30
  Write-Output ("  login: OK | rol: " + $sess.user.role)
} catch {
  Write-Output ("  login: " + $_.Exception.Response.StatusCode.value__)
}

Write-Output ""
Write-Output "=== 2) LOYIHA + AI ==="
$proj = Invoke-RestMethod -Uri "$base/api/projects" -Method POST -ContentType "application/json" -Body '{"title":"Kafe menyusi","category":"restoran","brief":"Kafe uchun onlayn menyu va buyurtma berish ilovasi"}' -WebSession $s -TimeoutSec 40
$id = $proj.project.id
$gen = Invoke-RestMethod -Uri "$base/api/projects/$id/generate" -Method POST -WebSession $s -TimeoutSec 120
Write-Output ("  AI: " + $gen.generatedBy + " | " + $gen.model + " | " + $gen.spec.pages.Count + " sahifa")

Write-Output ""
Write-Output "=== 3) PUBLISH ==="
try {
  $pub = Invoke-RestMethod -Uri "$base/api/projects/$id/publish" -Method POST -WebSession $s -TimeoutSec 40
  Write-Output ("  status: " + $pub.project.status)
} catch { Write-Output ("  xato: " + $_.Exception.Message) }

Write-Output ""
Write-Output "=== 4) OMMAVIY SAHIFA /p/[id] ==="
try {
  $p = Invoke-WebRequest -Uri "$base/p/$id" -TimeoutSec 30 -UseBasicParsing
  $t = [regex]::Match($p.Content, "<title>(.*?)</title>").Groups[1].Value
  Write-Output ("  HTTP " + $p.StatusCode + " | " + $p.Content.Length + " bayt | title: " + $t)
  Write-Output ("  AppNest nishoni: " + ($p.Content -match "AppNest"))
} catch { Write-Output ("  xato: " + $_.Exception.Message) }

Write-Output ""
Write-Output "=== 5) RATE LIMIT (12 ta xato kirish) ==="
$codes = @()
for ($i = 0; $i -lt 12; $i++) {
  try { Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"x@y.uz","password":"wrong"}' -TimeoutSec 20 -UseBasicParsing | Out-Null; $codes += "200" }
  catch { $codes += $_.Exception.Response.StatusCode.value__ }
}
Write-Output ("  " + ($codes -join ","))

Write-Output ""
Write-Output "=== 6) MUOFFAQIYATLI LOGIN limitdan keyin ==="
try {
  Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@appnest.uz","password":"parol12345"}' -WebSession $s -TimeoutSec 40 | Out-Null
  Write-Output "  login: OK (limit muvaffaqiyatli kirishni bloklamadi)"
} catch {
  Write-Output ("  login: " + $_.Exception.Response.StatusCode.value__ + " (XATO)")
}

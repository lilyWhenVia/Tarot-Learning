$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "assets\cards\rws-manifest.json"
$cardsDir = Join-Path $root "assets\cards"

New-Item -ItemType Directory -Force -Path $cardsDir | Out-Null

$cards = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$requestHeaders = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) tarot-study-local-tool/1.0"
  "Api-User-Agent" = "tarot-study-local-tool/1.0"
  "Referer" = "https://commons.wikimedia.org/"
}

function Get-WikimediaImageUrl {
  param(
    [Parameter(Mandatory = $true)]
    [string] $SourceUrl
  )

  $fileName = [System.Uri]::UnescapeDataString(($SourceUrl -replace "^.*File:", ""))
  if (-not $fileName -or $fileName -eq $SourceUrl) {
    throw "Cannot parse Wikimedia file name from $SourceUrl"
  }

  $title = "File:$fileName"
  $encodedTitle = [System.Uri]::EscapeDataString($title)
  $apiUrl = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=420&titles=$encodedTitle"
  $json = Invoke-RestMethod -Uri $apiUrl -Headers $requestHeaders
  $page = $json.query.pages.PSObject.Properties.Value | Select-Object -First 1
  $info = $page.imageinfo | Select-Object -First 1

  if ($info.thumburl) {
    return [string] $info.thumburl
  }

  if ($info.url) {
    return [string] $info.url
  }

  throw "Cannot resolve image URL for $title"
}

function Invoke-WithRetry {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock] $Action,
    [int] $MaxAttempts = 6
  )

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      return & $Action
    }
    catch {
      if ($attempt -eq $MaxAttempts) {
        throw
      }

      $delay = [Math]::Min(90, 8 * $attempt)
      Write-Host "retry in $delay seconds"
      Start-Sleep -Seconds $delay
    }
  }
}

foreach ($card in $cards) {
  $target = Join-Path $root $card.local
  if ((Test-Path -LiteralPath $target) -and ((Get-Item -LiteralPath $target).Length -gt 0)) {
    Write-Host "skip $($card.local)"
    continue
  }

  Write-Host "download $($card.name)"
  $downloadUrl = Invoke-WithRetry -Action { Get-WikimediaImageUrl -SourceUrl $card.source }
  $tempTarget = "$target.download"
  if (Test-Path -LiteralPath $tempTarget) {
    Remove-Item -LiteralPath $tempTarget -Force
  }

  Invoke-WithRetry -Action {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempTarget -Headers $requestHeaders
  } | Out-Null
  if ((Get-Item -LiteralPath $tempTarget).Length -le 0) {
    throw "Downloaded empty file for $($card.name)"
  }

  Move-Item -LiteralPath $tempTarget -Destination $target -Force
  Start-Sleep -Milliseconds 1200
}

Write-Host "done"

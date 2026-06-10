$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = Join-Path $projectRoot ".tools\node-v22.13.0-win-x64"
$npm = Join-Path $nodePath "npm.cmd"

if (!(Test-Path $npm)) {
  Write-Host "Node portátil não encontrado em $nodePath" -ForegroundColor Red
  Write-Host "Baixe o Node.js portátil ou instale Node.js no Windows e tente novamente."
  exit 1
}

$env:Path = "$nodePath;$env:Path"
$env:npm_config_cache = Join-Path $projectRoot ".npm-cache"

Write-Host "Node:" -ForegroundColor Cyan
node --version

Write-Host "Instalando dependências..." -ForegroundColor Cyan
& $npm install

Write-Host "Iniciando AnglerFish em http://localhost:3000" -ForegroundColor Green
& $npm run dev

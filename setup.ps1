# Setup Script for Cyber Exam Platform
Write-Host "Initializing Setup..." -ForegroundColor Cyan

# Define project path
$ProjectDir = "C:\Users\Anirudh\.gemini\antigravity\scratch\cyber-exam-platform"
Set-Location $ProjectDir

# Clean old artifacts
Write-Host "Cleaning previous installation..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue }
if (Test-Path "prisma/dev.db") { Remove-Item "prisma/dev.db" -Force -ErrorAction SilentlyContinue }

# Install dependencies (Force specific versions to avoid caching issues)
Write-Host "Installing dependencies..." -ForegroundColor Cyan
# We install prisma explicitly to ensure it's in the tree
npm install

# Check if install succeeded
if (-not (Test-Path "node_modules")) {
    Write-Host "Error: npm install failed to create node_modules." -ForegroundColor Red
    Exit
}

# Generate Prisma Client (Enforcing version to match package.json)
Write-Host "Generating Database Client (Prisma 5.19.1)..." -ForegroundColor Cyan
# We use npx with specific version to prevent it from downloading v7 latest
npx prisma@5.19.1 generate

# Initialize Database
Write-Host "Pushing Database Schema..." -ForegroundColor Cyan
npx prisma@5.19.1 db push

# Final Verification
Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "To start the app, run:" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor Yellow
Write-Host "`nIf that fails with 'command not found', try:" -ForegroundColor White
Write-Host "    npx next dev" -ForegroundColor Yellow

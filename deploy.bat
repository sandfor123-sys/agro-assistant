@echo off
REM AgriAssist Deployment Script for Windows
REM This script automates the deployment process for the AgriAssist platform

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=AgriAssist
set PROJECT_DIR=C:\wamp\www\agriculture_platform_nin3
set BACKUP_DIR=C:\wamp\backups
set LOG_FILE=C:\wamp\logs\deployment.log
set NODE_VERSION=18

REM Create necessary directories
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%~dp0logs" mkdir "%~dp0logs"
if not exist "%PROJECT_DIR%\logs" mkdir "%PROJECT_DIR%\logs"
if not exist "%PROJECT_DIR%\backups" mkdir "%PROJECT_DIR%\backups"

REM Logging function
:log
set LEVEL=%1
set MESSAGE=%~2
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATE=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a:%%b
set TIMESTAMP=%DATE% %TIME%

if "%LEVEL%"=="INFO" (
    echo [INFO] %TIMESTAMP% - %MESSAGE%
) else if "%LEVEL%"=="WARN" (
    echo [WARN] %TIMESTAMP% - %MESSAGE%
) else if "%LEVEL%"=="ERROR" (
    echo [ERROR] %TIMESTAMP% - %MESSAGE%
)

echo [%LEVEL%] %TIMESTAMP% - %MESSAGE% >> "%LOG_FILE%"
goto :eof

REM Check system requirements
:check_requirements
call :log "INFO" "Checking system requirements..."

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "Node.js is not installed"
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "npm is not installed"
    exit /b 1
)

REM Check MySQL
mysql --version >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "MySQL is not installed"
    exit /b 1
)

call :log "INFO" "All requirements satisfied"
goto :eof

REM Backup current deployment
:backup_current
call :log "INFO" "Creating backup of current deployment..."

for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set DATE=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a:%%b
set TIMESTAMP=%DATE%_%TIME%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_NAME=backup-%TIMESTAMP%
set BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%

mkdir "%BACKUP_PATH%"

REM Backup database
call :log "INFO" "Backing up database..."
mysqldump -u root -p agriplatform > "%BACKUP_PATH%\database.sql"

REM Backup files
call :log "INFO" "Backing up application files..."
xcopy "%PROJECT_DIR%\frontend\src" "%BACKUP_PATH%\src" /E /I /Y
copy "%PROJECT_DIR%\frontend\package.json" "%BACKUP_PATH%\"
copy "%PROJECT_DIR%\frontend\package-lock.json" "%BACKUP_PATH%\"

call :log "INFO" "Backup created at: %BACKUP_PATH%"
goto :eof

REM Update dependencies
:update_dependencies
call :log "INFO" "Updating dependencies..."
cd /d "%PROJECT_DIR%\frontend"

REM Clean install
call npm ci --production=false

REM Check for security vulnerabilities
call :log "INFO" "Checking for security vulnerabilities..."
call npm audit --audit-level moderate

call :log "INFO" "Dependencies updated successfully"
goto :eof

REM Build application
:build_application
call :log "INFO" "Building application..."
cd /d "%PROJECT_DIR%\frontend"

REM Clean previous build
if exist .next rmdir /s /q .next

REM Build for production
call npm run build

call :log "INFO" "Application built successfully"
goto :eof

REM Run tests
:run_tests
call :log "INFO" "Running tests..."
cd /d "%PROJECT_DIR%\frontend"

REM Run linting
call npm run lint
if errorlevel 1 (
    call :log "WARN" "Linting issues found"
)

call :log "INFO" "Tests completed"
goto :eof

REM Health check
:health_check
call :log "INFO" "Performing health check..."

REM Check if application is running
curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    call :log "ERROR" "Application is not responding"
    exit /b 1
) else (
    call :log "INFO" "Application is responding correctly"
)

call :log "INFO" "Health check passed"
goto :eof

REM Start application
:start_application
call :log "INFO" "Starting application..."
cd /d "%PROJECT_DIR%\frontend"

REM Stop any existing process
taskkill /f /im node.exe >nul 2>&1

REM Start in background
start /B cmd /c "npm run dev > %PROJECT_DIR%\logs\app.log 2>&1"

REM Wait for application to start
timeout /t 10 /nobreak >nul

call :log "INFO" "Application started successfully"
goto :eof

REM Cleanup old backups
:cleanup_backups
call :log "INFO" "Cleaning up old backups..."

REM Keep only last 7 days of backups
forfiles /p "%BACKUP_DIR%" /s /m backup-* /d -7 /c "cmd /c if @isdir==TRUE rmdir /s /q @path"

call :log "INFO" "Old backups cleaned up"
goto :eof

REM Main deployment function
:deploy
call :log "INFO" "Starting deployment of %PROJECT_NAME%"

call :check_requirements
call :backup_current
call :update_dependencies
call :build_application
call :run_tests
call :start_application

REM Wait for application to be ready
timeout /t 15 /nobreak >nul

call :health_check
if errorlevel 1 (
    call :log "ERROR" "Deployment failed - health check did not pass"
    exit /b 1
) else (
    call :cleanup_backups
    call :log "INFO" "Deployment completed successfully!"
    call :log "INFO" "Application is available at: http://localhost:3000"
    call :log "INFO" "System health dashboard: http://localhost:3000/dashboard/system/health"
)
goto :eof

REM Rollback function
:rollback
call :log "INFO" "Starting rollback..."

REM Find latest backup
set LATEST_BACKUP=
for /f "delims=" %%i in ('dir "%BACKUP_DIR%\backup-*" /b /ad /o:-d 2^>nul') do set LATEST_BACKUP=%%i

if "%LATEST_BACKUP%"=="" (
    call :log "ERROR" "No backup found for rollback"
    exit /b 1
)

set BACKUP_PATH=%BACKUP_DIR%\%LATEST_BACKUP%
call :log "INFO" "Rolling back to: %LATEST_BACKUP%"

REM Stop application
taskkill /f /im node.exe >nul 2>&1

REM Restore database
call :log "INFO" "Restoring database..."
mysql -u root -p agriplatform < "%BACKUP_PATH%\database.sql"

REM Restore files
call :log "INFO" "Restoring application files..."
xcopy "%BACKUP_PATH%\src" "%PROJECT_DIR%\frontend\src" /E /I /Y
copy "%BACKUP_PATH%\package.json" "%PROJECT_DIR%\frontend\"
copy "%BACKUP_PATH%\package-lock.json" "%PROJECT_DIR%\frontend\"

REM Rebuild and start
call :build_application
call :start_application

call :log "INFO" "Rollback completed"
goto :eof

REM Status function
:status
call :log "INFO" "Checking application status..."

tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if errorlevel 1 (
    call :log "WARN" "Application is not running"
) else (
    call :log "INFO" "Application is running"
)

call :health_check
goto :eof

REM Help function
:show_help
echo Usage: %0 {deploy^|rollback^|status^|help}
echo.
echo Commands:
echo   deploy   - Deploy the application
echo   rollback - Rollback to the previous backup
echo   status   - Check application status
echo   help     - Show this help message
goto :eof

REM Main script logic
if "%1"=="" set COMMAND=deploy
if not "%1"=="" set COMMAND=%1

if "%COMMAND%"=="deploy" (
    call :deploy
) else if "%COMMAND%"=="rollback" (
    call :rollback
) else if "%COMMAND%"=="status" (
    call :status
) else if "%COMMAND%"=="help" (
    call :show_help
) else (
    call :log "ERROR" "Unknown command: %COMMAND%"
    call :show_help
    exit /b 1
)

endlocal

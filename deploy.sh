#!/bin/bash

# AgriAssist Deployment Script
# This script automates the deployment process for the AgriAssist platform

set -e  # Exit on any error

# Configuration
PROJECT_NAME="AgriAssist"
PROJECT_DIR="/c/wamp/www/agriculture_platform_nin3"
BACKUP_DIR="/c/wamp/backups"
LOG_FILE="/c/wamp/logs/deployment.log"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message"
            ;;
    esac
    
    echo "[$level] $timestamp - $message" >> "$LOG_FILE"
}

# Check if running as administrator
check_admin() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "This script must be run as administrator"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    log "INFO" "Creating necessary directories..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$PROJECT_DIR/logs"
    mkdir -p "$PROJECT_DIR/backups"
}

# Backup current deployment
backup_current() {
    log "INFO" "Creating backup of current deployment..."
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup database
    log "INFO" "Backing up database..."
    mysqldump -u root -p agriplatform > "$backup_path/database.sql"
    
    # Backup files
    log "INFO" "Backing up application files..."
    cp -r "$PROJECT_DIR/frontend/src" "$backup_path/"
    cp "$PROJECT_DIR/frontend/package.json" "$backup_path/"
    cp "$PROJECT_DIR/frontend/package-lock.json" "$backup_path/"
    
    log "INFO" "Backup created at: $backup_path"
}

# Check system requirements
check_requirements() {
    log "INFO" "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    local current_node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $current_node_version -lt $NODE_VERSION ]]; then
        log "ERROR" "Node.js version $NODE_VERSION or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed"
        exit 1
    fi
    
    # Check MySQL
    if ! command -v mysql &> /dev/null; then
        log "ERROR" "MySQL is not installed"
        exit 1
    fi
    
    log "INFO" "All requirements satisfied"
}

# Update dependencies
update_dependencies() {
    log "INFO" "Updating dependencies..."
    cd "$PROJECT_DIR/frontend"
    
    # Clean install
    npm ci --production=false
    
    # Check for security vulnerabilities
    log "INFO" "Checking for security vulnerabilities..."
    npm audit --audit-level moderate
    
    log "INFO" "Dependencies updated successfully"
}

# Build application
build_application() {
    log "INFO" "Building application..."
    cd "$PROJECT_DIR/frontend"
    
    # Clean previous build
    rm -rf .next
    
    # Build for production
    npm run build
    
    log "INFO" "Application built successfully"
}

# Run tests
run_tests() {
    log "INFO" "Running tests..."
    cd "$PROJECT_DIR/frontend"
    
    # Run linting
    npm run lint || log "WARN" "Linting issues found"
    
    # Run type checking if available
    if npm run type-check &> /dev/null; then
        npm run type-check
    fi
    
    log "INFO" "Tests completed"
}

# Database migration
migrate_database() {
    log "INFO" "Running database migrations..."
    cd "$PROJECT_DIR/frontend"
    
    # Check if migration script exists
    if [[ -f "scripts/migrate.js" ]]; then
        node scripts/migrate.js
    else
        log "WARN" "No migration script found"
    fi
}

# Health check
health_check() {
    log "INFO" "Performing health check..."
    
    # Check if application is running
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log "INFO" "Application is responding correctly"
    else
        log "ERROR" "Application is not responding"
        return 1
    fi
    
    # Check database connection
    if mysql -u root -p -e "SELECT 1" agriplatform &> /dev/null; then
        log "INFO" "Database connection is working"
    else
        log "ERROR" "Database connection failed"
        return 1
    fi
    
    log "INFO" "Health check passed"
}

# Start application
start_application() {
    log "INFO" "Starting application..."
    cd "$PROJECT_DIR/frontend"
    
    # Stop any existing process
    pkill -f "next dev" || true
    
    # Start in background
    nohup npm run dev > "$PROJECT_DIR/logs/app.log" 2>&1 &
    
    # Wait for application to start
    sleep 10
    
    # Verify it's running
    if pgrep -f "next dev" > /dev/null; then
        log "INFO" "Application started successfully"
    else
        log "ERROR" "Failed to start application"
        return 1
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "INFO" "Cleaning up old backups..."
    
    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -type d -name "backup-*" -mtime +7 -exec rm -rf {} \;
    
    log "INFO" "Old backups cleaned up"
}

# Main deployment function
deploy() {
    log "INFO" "Starting deployment of $PROJECT_NAME"
    
    check_admin
    create_directories
    check_requirements
    backup_current
    update_dependencies
    build_application
    run_tests
    migrate_database
    start_application
    
    # Wait for application to be ready
    sleep 15
    
    if health_check; then
        cleanup_backups
        log "INFO" "Deployment completed successfully!"
        log "INFO" "Application is available at: http://localhost:3000"
        log "INFO" "System health dashboard: http://localhost:3000/dashboard/system/health"
    else
        log "ERROR" "Deployment failed - health check did not pass"
        exit 1
    fi
}

# Rollback function
rollback() {
    log "INFO" "Starting rollback..."
    
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -n 1)
    local backup_path="$BACKUP_DIR/$latest_backup"
    
    if [[ -z "$latest_backup" ]]; then
        log "ERROR" "No backup found for rollback"
        exit 1
    fi
    
    log "INFO" "Rolling back to: $latest_backup"
    
    # Stop application
    pkill -f "next dev" || true
    
    # Restore database
    log "INFO" "Restoring database..."
    mysql -u root -p agriplatform < "$backup_path/database.sql"
    
    # Restore files
    log "INFO" "Restoring application files..."
    cp -r "$backup_path/src" "$PROJECT_DIR/frontend/"
    cp "$backup_path/package.json" "$PROJECT_DIR/frontend/"
    cp "$backup_path/package-lock.json" "$PROJECT_DIR/frontend/"
    
    # Rebuild and start
    build_application
    start_application
    
    log "INFO" "Rollback completed"
}

# Status function
status() {
    log "INFO" "Checking application status..."
    
    if pgrep -f "next dev" > /dev/null; then
        log "INFO" "Application is running"
    else
        log "WARN" "Application is not running"
    fi
    
    health_check
}

# Help function
show_help() {
    echo "Usage: $0 {deploy|rollback|status|help}"
    echo ""
    echo "Commands:"
    echo "  deploy   - Deploy the application"
    echo "  rollback - Rollback to the previous backup"
    echo "  status   - Check application status"
    echo "  help     - Show this help message"
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log "ERROR" "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

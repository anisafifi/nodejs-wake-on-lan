# Docker Implementation Summary

## Overview

Successfully dockerized the Wake-on-LAN application into a single container with one exposed port (3000). The implementation uses a multi-stage Docker build that combines both the Next.js frontend and Express backend into one unified application.

## Changes Made

### 1. Next.js Configuration (`frontend/next.config.ts`)
- Changed output mode from `standalone` to `export` for static site generation
- Removed rewrites configuration (no longer needed as backend serves the frontend)
- Added `images.unoptimized` for static export compatibility

### 2. API Client (`frontend/lib/api.ts`)
- Changed `API_BASE_URL` from `http://localhost:3001` to empty string `''`
- This allows the frontend to call APIs on the same origin

### 3. Backend API (`backend/src/api.ts`)
- Added `path` and `fileURLToPath` imports for serving static files
- Added production mode static file serving:
  - Serves frontend static files from `/app/frontend-build`
  - Routes API requests to Express endpoints
  - Routes all other requests to frontend `index.html`
- Maintains separate 404 handler for development mode

### 4. Dockerfile
- **Stage 1 (frontend-builder)**: Builds Next.js frontend as static files (output to `out/`)
- **Stage 2 (backend-builder)**: Compiles TypeScript backend to JavaScript
- **Stage 3 (production)**: 
  - Uses `node:20-alpine` for minimal size
  - Installs backend production dependencies only
  - Copies compiled backend from stage 2
  - Copies frontend static build from stage 1 to `frontend-build/`
  - Copies startup script and makes it executable
  - Exposes port 3000

### 5. Docker Compose (`docker-compose.yml`)
- Single service definition: `wol-app`
- Port mapping: `3000:3000`
- Volumes:
  - `./devices.json` - Persists device configuration
  - `./logs` - Persists application logs
- Environment variables: `NODE_ENV=production`, `PORT=3000`, `CORS_ORIGIN=*`
- `network_mode: host` - Required for Wake-on-LAN functionality
- `restart: unless-stopped` - Auto-restart on failure

### 6. Startup Script (`docker-start.sh`)
- Creates `devices.json` if it doesn't exist
- Copies from `devices.example.json` or creates empty array
- Starts the backend Node.js server

### 7. Docker Ignore (`.dockerignore`)
- Excludes unnecessary files from build context
- Reduces build time and image size
- Excludes: `node_modules`, `dist`, `.next`, logs, environment files

### 8. Documentation
- **DOCKER.md**: Comprehensive Docker deployment guide
  - Quick start instructions
  - Architecture explanation
  - Environment variables
  - Volume configuration
  - Network mode explanation
  - Troubleshooting guide
  
- **README.md**: Updated main documentation
  - Added Docker quick start section
  - Expanded project structure
  - Added CLI usage examples
  - Detailed API endpoint documentation
  - Configuration examples
  - Complete feature list

### 9. Build Test Scripts
- `build-test.bat` (Windows)
- `build-test.sh` (Linux/macOS)
- Automated Docker build testing
- Provides run instructions after successful build

## Architecture

```
┌─────────────────────────────────────┐
│   Docker Container (Port 3000)      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Express Backend (Node.js)   │ │
│  │                               │ │
│  │  • API Routes (/api/*)       │ │
│  │  • Swagger UI (/api-docs)    │ │
│  │  • Static File Server (/)    │ │
│  └───────────────────────────────┘ │
│              ▼                      │
│  ┌───────────────────────────────┐ │
│  │   Next.js Frontend (Static)   │ │
│  │                               │ │
│  │  • React Components          │ │
│  │  • Static Assets             │ │
│  │  • Client-side Routing       │ │
│  └───────────────────────────────┘ │
│                                     │
│  Volumes:                           │
│  • /app/devices.json                │
│  • /app/logs                        │
└─────────────────────────────────────┘
```

## How It Works

1. **Build Phase**:
   - Frontend is built as static files using Next.js `export` mode
   - Backend TypeScript is compiled to JavaScript
   - Both are combined into a single production image

2. **Runtime**:
   - Single Node.js process runs the Express server
   - Express serves API endpoints at `/api/*`
   - Express serves Swagger UI at `/api-docs`
   - Express serves frontend static files for all other routes
   - Only port 3000 is exposed

3. **Networking**:
   - Uses `host` network mode for Wake-on-LAN to function
   - Allows sending broadcast packets on local network

## Usage

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

### Production (Docker)
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```
- Application: http://localhost:3000

## Benefits

1. **Simplified Deployment**: Single container instead of multiple services
2. **One Port**: Only port 3000 needs to be exposed
3. **Production Ready**: Optimized build with minimal image size
4. **Persistent Storage**: Device config and logs survive restarts
5. **Auto Restart**: Container restarts automatically on failure
6. **Easy Updates**: `docker-compose down && docker-compose up -d --build`

## Testing

To test the Docker build:

```bash
# Windows
build-test.bat

# Linux/macOS
chmod +x build-test.sh
./build-test.sh
```

## File Structure

```
nodejs-wol/
├── backend/
│   └── src/
│       └── api.ts              # ✏️ Modified - Added static file serving
├── frontend/
│   ├── next.config.ts          # ✏️ Modified - Changed to 'export' mode
│   └── lib/
│       └── api.ts              # ✏️ Modified - Changed API_BASE_URL
├── Dockerfile                  # ✨ Created - Multi-stage build
├── docker-compose.yml          # ✨ Created - Service configuration
├── docker-start.sh            # ✨ Created - Startup script
├── .dockerignore              # ✨ Created - Build optimization
├── DOCKER.md                  # ✨ Created - Docker guide
├── README.md                  # ✏️ Modified - Added Docker section
├── build-test.bat             # ✨ Created - Windows test script
└── build-test.sh              # ✨ Created - Linux/macOS test script
```

Legend:
- ✨ Created - New file
- ✏️ Modified - Existing file updated

## Next Steps

1. Test the Docker build:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   ```
   http://localhost:3000
   ```

3. View API documentation:
   ```
   http://localhost:3000/api-docs
   ```

4. Check logs:
   ```bash
   docker-compose logs -f
   ```

## Known Limitations

- **Windows/macOS**: `network_mode: host` has limited support on Docker Desktop
  - Wake-on-LAN may not work properly on these platforms
  - Consider running directly on host for full WOL functionality
  
- **Static Export**: Next.js export mode doesn't support:
  - API routes (not needed as we use backend API)
  - ISR (not needed for this use case)
  - Image optimization (disabled with `unoptimized: true`)

## Troubleshooting

### Build Fails
- Ensure Docker is running
- Check Docker has enough resources (RAM/disk)
- Try cleaning Docker cache: `docker system prune -a`

### Frontend Not Loading
- Check logs: `docker logs wol-app`
- Verify frontend build succeeded in Dockerfile
- Ensure `NODE_ENV=production` is set

### WOL Not Working
- Verify `network_mode: host` is set
- Check target device has WOL enabled in BIOS
- Ensure target is on same network
- Try running on Linux host (better network_mode support)

### Port 3000 Already in Use
- Change port in docker-compose.yml: `"3001:3000"`
- Or stop conflicting service

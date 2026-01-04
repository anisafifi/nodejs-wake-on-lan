# Docker Deployment Guide

This guide explains how to build and run the Wake-on-LAN application as a Docker container with a single exposed port.

## Quick Start

### Using Pre-built Image (Recommended)

```bash
# Pull from GitHub Container Registry and start
docker pull ghcr.io/hixbehq/nodejs-wol:latest
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3000`

### Building Locally

```bash
# Build the image
docker build -t wol-app .

# Run the container
docker run -d \
  --name wol-app \
  --network host \
  -v $(pwd)/devices.json:/app/devices.json \
  -v $(pwd)/logs:/app/logs \
  -e NODE_ENV=production \
  -e PORT=3000 \
  wol-app

# View logs
docker logs -f wol-app

# Stop and remove the container
docker stop wol-app && docker rm wol-app
```

## Architecture

The Docker setup uses a multi-stage build process:

1. **Frontend Build Stage**: Builds Next.js frontend as static files (output: 'export')
2. **Backend Build Stage**: Compiles TypeScript backend to JavaScript
3. **Production Stage**: Combines both builds into a single lightweight image

## How It Works

- The backend Express server (port 3000) serves:
  - API endpoints at `/api/*`
  - API documentation at `/api-docs`
  - Frontend static files for all other routes
- Only port 3000 is exposed from the container
- `network_mode: host` is used to enable Wake-on-LAN functionality

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

## Volumes

The docker-compose setup mounts two volumes:

- `./devices.json` - Device configuration (persists across restarts)
- `./logs` - Application logs

## Network Mode

The container uses `network_mode: host` which is required for Wake-on-LAN to function properly. This allows the container to:
- Send magic packets to the broadcast address
- Access the network interfaces of the host machine

**Note**: On Windows and macOS, Docker Desktop doesn't fully support `host` network mode. For these platforms, consider running the application directly on the host or use bridge mode with port mapping (WOL may have limited functionality).

## Building for Production

### Optimize Image Size

The production image is based on `node:20-alpine` for minimal size. Current image size is approximately ~200MB.

### Security Considerations

1. The container runs as the default node user (non-root)
2. Only necessary files are copied to the production stage
3. Development dependencies are excluded (`npm ci --omit=dev`)
4. Sensitive files are excluded via `.dockerignore`

## Troubleshooting

### WOL Not Working

- Ensure `network_mode: host` is set
- Verify target devices are on the same network
- Check that target devices have WOL enabled in BIOS/UEFI
- Ensure the network adapter supports WOL

### Cannot Access Application

- Check if port 3000 is already in use: `netstat -an | findstr :3000`
- Verify the container is running: `docker ps`
- Check logs for errors: `docker logs wol-app`

### Frontend Not Loading

- Verify the frontend was built correctly in the Docker image
- Check that `NODE_ENV=production` is set
- Ensure static files are in `/app/frontend-build`

## Development vs Production

### Development (Local)

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

### Production (Docker)

Single container serving both backend and frontend on port 3000.

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## API Documentation

Once the container is running, access the Swagger documentation at:
`http://localhost:3000/api-docs`

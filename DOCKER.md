# Docker Setup for WakeSprint

This application is fully dockerized with both backend and frontend services.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up -d

# Build with no cache
docker-compose build --no-cache

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop and Remove
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Rebuild
```bash
# Rebuild and restart services
docker-compose up -d --build
```

## Important Notes

### Wake-on-LAN Network Requirements

The backend service uses `network_mode: host` to enable Wake-on-LAN functionality. This is necessary because WoL requires sending magic packets to the local network, which doesn't work properly with Docker's bridge networking.

**Implications:**
- The backend container shares the host's network stack
- Port mapping is ignored when using host networking
- The backend will bind directly to port 3001 on the host

### Persistent Data

The following directories are mounted as volumes:
- `./backend/devices.json` - Device configuration
- `./backend/logs` - Application logs

## Environment Variables

You can customize the following environment variables in `docker-compose.yml`:

**Backend:**
- `NODE_ENV` - Set to production by default
- `PORT` - Backend port (default: 3001)

**Frontend:**
- `NODE_ENV` - Set to production by default
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Development

For development purposes, you might want to use volume mounts for live reloading:

```yaml
# Add to backend service in docker-compose.yml
volumes:
  - ./backend/src:/app/src
  - ./backend/devices.json:/app/devices.json
  - ./backend/logs:/app/logs
```

## Troubleshooting

1. **Port conflicts:** Ensure ports 3001 and 3002 are not in use
2. **Wake-on-LAN not working:** Verify the backend is using `network_mode: host`
3. **Rebuild after changes:** Run `docker-compose up -d --build` after modifying Dockerfiles
4. **Check logs:** Use `docker-compose logs -f` to view real-time logs

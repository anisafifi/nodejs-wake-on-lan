# Quick Reference - Wake-on-LAN App

## Docker Commands

### Pull and Start Application
```bash
# Pull latest from GitHub Container Registry
docker pull ghcr.io/hixbehq/nodejs-wol:latest

# Start with docker-compose
docker-compose up -d
```

### Stop Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Application
```bash
docker-compose restart
```

### Rebuild and Start
```bash
docker-compose up -d --build
```

### Check Status
```bash
docker-compose ps
```

## URLs

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Development Mode

### Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

### URLs (Development)
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- API Docs: http://localhost:3000/api-docs

## CLI Commands

```bash
cd backend
npm run build

# Wake a device
node dist/cli.js wake <device-name>

# List devices
node dist/cli.js list

# Add device
node dist/cli.js add <name> <mac> [ip] [broadcast]

# Update device
node dist/cli.js update <name> --mac <mac> --ip <ip>

# Remove device
node dist/cli.js remove <device-name>

# Wake all
node dist/cli.js wake-all
```

## API Endpoints (Quick Reference)

### Devices
- `GET /api/devices` - List all devices
- `GET /api/devices/:name` - Get device
- `POST /api/devices` - Add device
- `PUT /api/devices/:name` - Update device
- `DELETE /api/devices/:name` - Remove device

### Wake
- `GET /api/wake?device=<name>` - Wake by name
- `GET /api/wake?mac=<mac>` - Wake by MAC
- `POST /api/wake/:name` - Wake by name
- `POST /api/wake` - Wake by MAC (JSON body)
- `POST /api/wake-all` - Wake all devices
- `POST /api/wake-multiple` - Wake multiple (JSON body)

## Example Device

```json
{
  "name": "My PC",
  "mac": "00:11:22:33:44:55",
  "ip": "192.168.1.100",
  "broadcast": "192.168.1.255"
}
```

## Troubleshooting

### WOL Not Working
1. Check device has WOL enabled in BIOS
2. Verify device is on same network
3. Use Ethernet (not WiFi)
4. Ensure `network_mode: host` in docker-compose.yml

### Can't Access Web Interface
1. Check container is running: `docker-compose ps`
2. Check logs: `docker-compose logs -f`
3. Verify port 3000 is not in use
4. Try restart: `docker-compose restart`

### CORS Errors
- Set `CORS_ORIGIN` in docker-compose.yml environment

### Device Not Found
- Check `devices.json` exists in project root
- Verify device name matches exactly (case-sensitive)

## File Locations (Docker Container)

- Devices: `/app/devices.json` (mapped to host)
- Logs: `/app/logs/` (mapped to host)
- Backend: `/app/dist/`
- Frontend: `/app/frontend-build/`

## Environment Variables

### Backend
- `NODE_ENV` - production/development
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - CORS allowed origins

### Frontend
- `NEXT_PUBLIC_API_URL` - API base URL

## Common Tasks

### Add Device via API
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"MyPC","mac":"00:11:22:33:44:55"}'
```

### Wake Device via API
```bash
curl -X POST http://localhost:3000/api/wake/MyPC
```

### Wake by MAC
```bash
curl -X POST http://localhost:3000/api/wake \
  -H "Content-Type: application/json" \
  -d '{"mac":"00:11:22:33:44:55","broadcast":"192.168.1.255"}'
```

### Get All Devices
```bash
curl http://localhost:3000/api/devices
```

## Backup and Restore

### Backup
```bash
# Devices
cp devices.json devices.backup.json

# Logs
cp -r logs logs.backup
```

### Restore
```bash
# Devices
cp devices.backup.json devices.json

# Restart container to apply
docker-compose restart
```

## Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Performance

### Check Container Resource Usage
```bash
docker stats wol-app
```

### Check Container Size
```bash
docker images wol-app
```

### View Container Details
```bash
docker inspect wol-app
```

## Security

- Rate Limit: 100 requests per 15 minutes per IP
- CGitHub Container Registry

### Pull Image
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:latest
docker pull ghcr.io/hixbehq/nodejs-wol:v1.0.0
```

### Available Tags
- `latest` - Latest main branch
- `v1.0.0` - Specific version
- `v1.0` - Minor version
- `v1` - Major version
- `main-<sha>` - Specific commit

## Support

- Full Documentation: [README.md](README.md)
- Docker Guide: [DOCKER.md](DOCKER.md)
- Implementation Details: [DOCKER_IMPLEMENTATION.md](DOCKER_IMPLEMENTATION.md)
- GitHub Registry: [.github/DOCKER_REGISTRY.md](.github/DOCKER_REGISTRY.md)
- GitHub Actions: [.github/workflows/README.md](.github/workflows/README

- Full Documentation: [README.md](README.md)
- Docker Guide: [DOCKER.md](DOCKER.md)
- Implementation Details: [DOCKER_IMPLEMENTATION.md](DOCKER_IMPLEMENTATION.md)

# Node.js Wake-on-LAN Application

A full-stack Wake-on-LAN (WOL) application with CLI, REST API, and web interface for waking up devices on your network.

## Features

- 🌐 **Web Interface**: Modern React UI built with Next.js 15 and Tailwind CSS
- 🚀 **REST API**: Full CRUD operations for device management and wake operations
- 💻 **CLI Tool**: Command-line interface for quick operations
- 📝 **Device Management**: Add, update, duplicate, and remove network devices
- 🔄 **Wake Operations**: Wake single devices, multiple devices, or all devices
- 📚 **API Documentation**: Interactive Swagger UI documentation
- 🔒 **Security**: Rate limiting, CORS support, request ID tracking
- 📊 **Logging**: Comprehensive Winston-based logging to console and files
- 🐳 **Docker Support**: Single-container deployment with one exposed port

## Quick Start

### Docker (Recommended for Production)

#### Using Pre-built Image from GitHub Container Registry

```bash
docker pull ghcr.io/hixbehq/nodejs-wol:latest
docker-compose up -d
```

#### Building Locally

```bash
# Uncomment 'build: .' in docker-compose.yml, then:
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`

See [DOCKER.md](DOCKER.md) for detailed Docker deployment instructions and [.github/DOCKER_REGISTRY.md](.github/DOCKER_REGISTRY.md) for GitHub Container Registry usage.

### Local Development

#### Prerequisites

- Node.js 18 or higher
- npm or yarn

#### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:3000`

#### Frontend Setup

```bash
cd frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3001`

## Project Structure

```
nodejs-wol/
├── backend/          # Express API server
│   ├── src/
│   │   ├── api.ts           # Express application and routes
│   │   ├── device-manager.ts  # Device configuration management
│   │   ├── wol-service.ts     # Wake-on-LAN core functionality
│   │   ├── cli.ts             # CLI implementation
│   │   ├── middleware.ts      # Custom Express middleware
│   │   ├── logger.ts          # Winston logger configuration
│   │   ├── swagger.ts         # OpenAPI specification
│   │   └── types.ts           # TypeScript type definitions
│   ├── devices.json          # Device configuration storage
│   └── package.json
├── frontend/         # Next.js React application
│   ├── app/
│   │   └── page.tsx          # Main page component
│   ├── components/
│   │   ├── DeviceCard.tsx    # Device display card
│   │   └── DeviceModal.tsx   # Add/Edit/Duplicate modal
│   ├── lib/
│   │   └── api.ts            # API client
│   └── package.json
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Docker Compose configuration
└── docker-start.sh         # Container startup script
```

## CLI Usage

```bash
cd backend
npm run build

# Wake a device
node dist/cli.js wake <device-name>

# List all devices
node dist/cli.js list

# Add a new device
node dist/cli.js add <name> <mac> [ip] [broadcast]

# Update a device
node dist/cli.js update <name> [--mac MAC] [--ip IP] [--broadcast BROADCAST] [--name NEW_NAME]

# Remove a device
node dist/cli.js remove <device-name>

# Wake all devices
node dist/cli.js wake-all
```

## API Endpoints

### Devices

- `GET /api/devices` - Get all devices
- `GET /api/devices/:name` - Get device by name
- `POST /api/devices` - Add a new device
- `PUT /api/devices/:name` - Update a device
- `DELETE /api/devices/:name` - Remove a device

### Wake Operations

- `GET /api/wake?device=<name>` - Wake device by name (query parameter)
- `GET /api/wake?mac=<mac>&broadcast=<broadcast>` - Wake by MAC address
- `POST /api/wake/:name` - Wake device by name
- `POST /api/wake` - Wake by MAC address (body: `{mac, broadcast}`)
- `POST /api/wake-all` - Wake all configured devices
- `POST /api/wake-multiple` - Wake multiple specific devices (body: `{devices: []}`)

### Documentation

- `GET /api-docs` - Swagger UI documentation
- `GET /api-docs.json` - OpenAPI JSON specification
- `GET /health` - Health check endpoint

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
CORS_ORIGIN=*
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Device Configuration

Devices are stored in `backend/devices.json`:

```json
[
  {
    "name": "My PC",
    "mac": "00:11:22:33:44:55",
    "ip": "192.168.1.100",
    "broadcast": "192.168.1.255"
  }
]
```

### Fields

- `name` (required): Unique device identifier
- `mac` (required): MAC address in format `XX:XX:XX:XX:XX:XX`
- `ip` (optional): Device IP address
- `broadcast` (optional): Broadcast address (default: `255.255.255.255`)

## Features in Detail

### Request ID Tracking

Every API request receives a unique request ID in the format:
```
hixbe-YYYYMMDDHHMMSS-######
```

The ID is returned in the `X-Request-Id` response header.

### Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

Rate limit information is provided in response headers:
- `RateLimit-Limit`: Total requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time until reset

### Logging

Winston logger writes logs to:
- Console (all levels in development, info+ in production)
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Wake-on-LAN Requirements

For WOL to work correctly:

1. **Target Device**:
   - Wake-on-LAN enabled in BIOS/UEFI
   - Network adapter supports WOL
   - Computer is connected via Ethernet (wireless WOL is unreliable)

2. **Network**:
   - Devices must be on the same local network
   - Some routers may block broadcast packets

3. **Docker**:
   - Must use `network_mode: host` (see DOCKER.md)

## Technology Stack

### Backend
- Node.js 18+
- TypeScript 5.7
- Express 4.21
- wake_on_lan 1.0
- Winston (logging)
- Commander 12.1 (CLI)
- Swagger UI Express (documentation)
- express-rate-limit (rate limiting)

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 3.4
- Lucide React (icons)

### DevOps
- Docker
- Docker Compose
- Multi-stage builds

## Development

### TypeScript Compilation

```bash
# Backend
cd backend
npm run build
npm run watch  # Watch mode

# Frontend
cd frontend
npm run build
```

## Troubleshooting

### Wake-on-LAN Not Working

1. Verify WOL is enabled in target device BIOS
2. Check device is connected via Ethernet
3. Ensure correct MAC address format
4. Try specifying broadcast address explicitly
5. Check network router settings

### CORS Errors

Set `CORS_ORIGIN` environment variable in backend:
```env
CORS_ORIGIN=http://localhost:3001
```

### Port Already in Use

Change the port in backend `.env`:
```env
PORT=3001
```

Update frontend `.env.local` accordingly:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

MIT

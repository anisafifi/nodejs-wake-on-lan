# Wake-on-LAN Application

A full-stack Wake-on-LAN application with a modern Next.js frontend and Node.js backend API.

## Project Structure

```
nodejs-wol/
├── backend/          # Node.js + Express API server
│   ├── src/          # TypeScript source code
│   ├── dist/         # Compiled JavaScript
│   ├── logs/         # Application logs
│   └── devices.json  # Device configuration
└── frontend/         # Next.js 15 web application
    ├── app/          # Next.js app directory
    ├── components/   # React components
    └── lib/          # API client and utilities
```

## Features

### Backend API
- ✨ RESTful API with Swagger documentation
- 📦 Device configuration management
- 🎯 Wake single, multiple, or all devices
- 🔒 Rate limiting and request ID tracking
- 📝 Winston logging with file output
- ✅ Full TypeScript support

### Frontend
- 🎨 Modern UI with Next.js 15 and Tailwind CSS
- 📱 Responsive design
- 🌙 Dark mode support
- ⚡ Real-time device wake status
- 🔄 CRUD operations for device management

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run build
npm start
```

Backend will run on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3001

## Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level: error, warn, info, debug (default: info)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)

## Usage

1. Start the backend API server
2. Start the frontend development server
3. Open http://localhost:3001 in your browser
4. Add your devices using the "Add Device" button
5. Click "Wake Device" to send magic packets

## API Documentation

Interactive Swagger documentation available at: http://localhost:3000/api-docs

## Development

### Backend Development
```bash
cd backend
npm run dev  # Hot reload with tsx
```

### Frontend Development
```bash
cd frontend
npm run dev  # Next.js dev server
```

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Network Requirements

⚠️ **Important**: This application must run on the same network as the devices you want to wake, or have VPN access to that network. Wake-on-LAN uses broadcast packets that don't traverse the internet.

## License

MIT

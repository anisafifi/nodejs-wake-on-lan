# WakeSprint Backend API

RESTful API server for WakeSprint (Wake-on-LAN) operations built with Node.js, TypeScript, and Express.

## Features

- ✨ **REST API**: Full-featured API with Swagger documentation
- 📦 **Device Management**: Store and manage device configurations
- 🎯 **Wake Operations**: Single, multiple, or all devices
- 🔒 **Security**: Rate limiting, request IDs, disabled X-Powered-By header
- 📝 **Logging**: Winston logger with file and console output
- ✅ **Type-Safe**: Full TypeScript support

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

Start the server:

```bash
npm start
```

Development mode with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default. Set the `PORT` environment variable to change it.

## API Documentation

Interactive Swagger documentation is available at `http://localhost:3000/api-docs`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level: error, warn, info, debug (default: info)
- `DEVICES_DB_PATH` - Path to the SQLite database file (default: `./data/database.db`)

## Configuration

Devices are stored in a SQLite database. On first run, the service will migrate data from
`devices.json` if it exists, or seed the database with the example device.

## Logs

- `logs/combined.log` - All logs in JSON format
- `logs/error.log` - Error logs only

## License

MIT

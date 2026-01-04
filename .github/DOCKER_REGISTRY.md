# GitHub Container Registry Setup

This document explains how the Docker image is published to GitHub Container Registry (ghcr.io).

## Overview

The project uses GitHub Actions to automatically build and publish Docker images to GitHub Container Registry on every push to the `main` branch and when version tags are created.

## Registry URL

```
ghcr.io/hixbehq/nodejs-wol
```

## Image Tags

The workflow automatically creates multiple tags for each build:

- `latest` - Latest build from main branch
- `main` - Current main branch
- `v1.0.0` - Semantic version tags (if tagged)
- `v1.0` - Major.minor version
- `v1` - Major version only
- `main-<sha>` - Branch name with commit SHA

## Pulling the Image

### Pull Latest Version
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:latest
```

### Pull Specific Version
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:v1.0.0
```

### Pull by Commit SHA
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:main-abc1234
```

## Running from GitHub Registry

### Using Docker
```bash
docker run -d \
  --name wol-app \
  --network host \
  -v $(pwd)/devices.json:/app/devices.json \
  -v $(pwd)/logs:/app/logs \
  -e NODE_ENV=production \
  ghcr.io/hixbehq/nodejs-wol:latest
```

### Using Docker Compose

Update your `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wol-app:
    image: ghcr.io/hixbehq/nodejs-wol:latest
    ports:
      - "3000:3000"
    volumes:
      - ./devices.json:/app/devices.json
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CORS_ORIGIN=*
    network_mode: host
    restart: unless-stopped
```

Then run:
```bash
docker-compose pull
docker-compose up -d
```

## GitHub Actions Workflows

### 1. Docker Build and Publish (`docker-publish.yml`)

**Triggers:**
- Push to `main` branch
- Creation of version tags (`v*.*.*`)
- Manual workflow dispatch
- Pull requests (build only, no push)

**Features:**
- Multi-platform builds (linux/amd64, linux/arm64)
- Layer caching for faster builds
- Automatic semantic versioning
- Build provenance attestation
- Metadata extraction

**Permissions Required:**
- `contents: read` - Read repository contents
- `packages: write` - Write to GitHub Packages
- `id-token: write` - Generate provenance attestations

### 2. Docker Build Test (`docker-test.yml`)

**Triggers:**
- Pull requests to `main` branch
- Changes to backend, frontend, or Docker files
- Manual workflow dispatch

**Tests:**
- Docker image builds successfully
- Container starts without errors
- Health endpoint responds
- API endpoints are accessible
- Image size reporting

## Publishing a New Version

### 1. Update Version
Update version in relevant files (package.json, etc.)

### 2. Create Git Tag
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. Automatic Build
GitHub Actions will automatically:
- Build the Docker image
- Run tests
- Push to GitHub Container Registry with appropriate tags
- Generate build attestation

## Image Visibility

By default, GitHub Container Registry images are **private**. To make the image public:

1. Go to: https://github.com/users/hixbehq/packages/container/nodejs-wol/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Public"
5. Confirm the change

## Authentication

### For Public Images
No authentication required:
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:latest
```

### For Private Images

1. Create a Personal Access Token (PAT):
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `read:packages`
   - Generate and copy the token

2. Login to GitHub Container Registry:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

3. Pull the image:
```bash
docker pull ghcr.io/hixbehq/nodejs-wol:latest
```

## Build Cache

The workflow uses GitHub Actions cache to speed up builds:
- `cache-from: type=gha` - Use previous build cache
- `cache-to: type=gha,mode=max` - Save all layers to cache

Benefits:
- Faster subsequent builds
- Reduced bandwidth usage
- Lower build times in CI/CD

## Multi-Platform Support

Images are built for multiple platforms:
- `linux/amd64` - Standard x86_64 (Intel/AMD)
- `linux/arm64` - ARM64 (Apple Silicon, Raspberry Pi, etc.)

Docker will automatically pull the correct image for your platform.

## Monitoring Builds

### View Workflow Runs
https://github.com/hixbehq/nodejs-wol/actions

### View Published Packages
https://github.com/hixbehq?tab=packages

### Check Image Tags
```bash
# List all tags
gh api /user/packages/container/nodejs-wol/versions
```

## Troubleshooting

### Build Fails

1. Check workflow logs: https://github.com/hixbehq/nodejs-wol/actions
2. Verify Dockerfile syntax
3. Ensure all dependencies are available
4. Check GitHub Actions status: https://www.githubstatus.com/

### Cannot Pull Image

1. Verify image name and tag
2. Check if image is public or requires authentication
3. Ensure you're logged in (for private images)
4. Verify network connectivity

### Authentication Issues

1. Ensure `GITHUB_TOKEN` has correct permissions
2. For personal use, create a PAT with `read:packages` scope
3. Check token hasn't expired

### Image Size Issues

1. Review Dockerfile for optimization opportunities
2. Check `.dockerignore` is excluding unnecessary files
3. Use multi-stage builds (already implemented)
4. Consider using alpine base images (already using node:20-alpine)

## Best Practices

1. **Version Tags**: Always tag releases with semantic versions
2. **Latest Tag**: Reserve for stable main branch builds
3. **Security**: Regularly update base images and dependencies
4. **Testing**: Run tests before pushing to main
5. **Documentation**: Keep this file updated with changes

## Environment Variables

Same as local Docker deployment:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

## Example: Deploying to Production

```bash
# Pull latest image
docker pull ghcr.io/hixbehq/nodejs-wol:latest

# Stop existing container
docker stop wol-app && docker rm wol-app

# Run new container
docker run -d \
  --name wol-app \
  --network host \
  --restart unless-stopped \
  -v /data/wol/devices.json:/app/devices.json \
  -v /data/wol/logs:/app/logs \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://yourdomain.com \
  ghcr.io/hixbehq/nodejs-wol:latest
```

## Automated Deployments

To automatically deploy on new releases, you can:

1. Use Watchtower for automatic updates:
```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  wol-app --interval 300
```

2. Use GitHub Actions with deployment hooks
3. Use Kubernetes with image pull policies
4. Use Docker Swarm or Kubernetes for orchestration

## Security Scanning

Consider adding security scanning to the workflow:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Support

For issues related to:
- **Docker builds**: Check GitHub Actions logs
- **Registry access**: Verify authentication and permissions
- **Application issues**: Check container logs with `docker logs wol-app`
- **Network issues**: Verify `network_mode: host` is set

## Related Documentation

- [DOCKER.md](../DOCKER.md) - Docker deployment guide
- [DOCKER_IMPLEMENTATION.md](../DOCKER_IMPLEMENTATION.md) - Implementation details
- [README.md](../README.md) - Main project documentation
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick command reference

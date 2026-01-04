# GitHub Actions Workflows

This directory contains automated workflows for the Wake-on-LAN application.

## Workflows

### 1. Docker Build and Publish (`docker-publish.yml`)

Automatically builds and publishes Docker images to GitHub Container Registry.

**Triggers:**
- ✅ Push to `main` branch → Publishes `latest` tag
- ✅ Version tags (`v*.*.*`) → Publishes versioned tags
- ✅ Pull requests → Builds but doesn't publish
- ✅ Manual trigger → Via GitHub Actions UI

**Outputs:**
- Docker images pushed to `ghcr.io/hixbehq/nodejs-wol`
- Multiple tags: `latest`, `main`, `v1.0.0`, `v1.0`, `v1`, `main-<sha>`
- Build provenance attestations

**Platforms:**
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64)

### 2. Docker Build Test (`docker-test.yml`)

Tests Docker builds on pull requests.

**Triggers:**
- ✅ Pull requests to `main` branch
- ✅ Changes to Docker-related files
- ✅ Manual trigger

**Tests:**
- Docker image builds successfully
- Container starts without errors
- Health endpoint responds (http://localhost:3000/health)
- API endpoints accessible (http://localhost:3000/api/devices)
- Logs are generated correctly

## Setup Requirements

### Permissions

The workflows require these permissions (automatically granted):
- `contents: read` - Read repository code
- `packages: write` - Push to GitHub Container Registry
- `id-token: write` - Generate provenance attestations

### Secrets

No additional secrets required. The workflow uses the automatic `GITHUB_TOKEN` provided by GitHub Actions.

## Usage

### Automatic Publishing

1. **Merge to main:**
   ```bash
   git checkout main
   git merge feature-branch
   git push origin main
   ```
   → Publishes `ghcr.io/hixbehq/nodejs-wol:latest`

2. **Create version tag:**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
   → Publishes multiple tags: `v1.0.0`, `v1.0`, `v1`, `latest`

3. **Pull request:**
   - Creates PR → Builds and tests (no publish)
   - Verifies Docker build works before merging

### Manual Trigger

1. Go to: https://github.com/hixbehq/nodejs-wol/actions
2. Select "Docker Build and Publish" or "Docker Build Test"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

## Monitoring

### View Workflow Runs
https://github.com/hixbehq/nodejs-wol/actions

### Check Published Images
https://github.com/hixbehq?tab=packages

### View Logs
Click on any workflow run to see detailed logs for each step.

## Artifacts

Each successful build produces:
- Docker image in GitHub Container Registry
- Build provenance attestation
- Workflow summary with build details

## Cache Management

The workflows use GitHub Actions cache to speed up builds:
- Docker layer cache
- BuildKit cache
- Automatically managed (no manual cleanup needed)

Cache benefits:
- ~50-70% faster builds
- Reduced bandwidth usage
- Lower CI/CD costs

## Troubleshooting

### Build Fails

1. Check workflow logs
2. Verify Dockerfile syntax
3. Test build locally: `docker build -t test .`
4. Check for dependency issues

### Cannot Push to Registry

1. Verify workflow has `packages: write` permission
2. Check repository settings → Actions → General → Workflow permissions
3. Ensure not running from a fork (forks have limited permissions)

### Tests Fail

1. Check container logs in workflow
2. Test locally: `docker run --name test -p 3000:3000 <image>`
3. Verify health endpoint: `curl http://localhost:3000/health`

## Customization

### Change Triggers

Edit the `on:` section in workflow files:

```yaml
on:
  push:
    branches: [main, develop]  # Add more branches
    tags: ['v*', 'release-*']  # Add more tag patterns
```

### Add More Platforms

Edit the `platforms:` section:

```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

### Add Security Scanning

Add a security scan step:

```yaml
- name: Run Trivy scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/hixbehq/nodejs-wol:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Best Practices

1. ✅ Test builds locally before pushing
2. ✅ Use semantic versioning for tags
3. ✅ Review workflow logs for warnings
4. ✅ Keep workflows updated with latest action versions
5. ✅ Monitor image sizes and optimize if needed
6. ✅ Use pull requests for changes
7. ✅ Document breaking changes in release notes

## Related Documentation

- [DOCKER_REGISTRY.md](DOCKER_REGISTRY.md) - GitHub Container Registry guide
- [../DOCKER.md](../DOCKER.md) - Docker deployment guide
- [../README.md](../README.md) - Main documentation

## Support

For issues:
1. Check workflow logs first
2. Review error messages
3. Test locally with Docker
4. Open an issue with workflow run link

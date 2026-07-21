# Troubleshooting Guide

### Issue: Leaflet map tiles fail to load
- **Cause**: Network restriction or rate limit on OpenStreetMap tile servers.
- **Solution**: Switch base layer in the Map Legend (e.g. to Satellite or Dark mode tiles), or verify internet connectivity.

### Issue: `npm run build` fails with `tsc` module error
- **Cause**: Node modules missing or corrupt.
- **Solution**: Run `rm -rf node_modules package-lock.json && npm install`.

### Issue: Vite dev server port conflict (Port 3000 in use)
- **Cause**: Another process is running on port 3000.
- **Solution**: Vite automatically tries port 3001, or you can specify `--port 3005` in your dev script.

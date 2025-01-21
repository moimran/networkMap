const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const pathModule = require('path');  // Rename to avoid conflicts
const os = require('os');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API routes for icons
app.get('/api/icons/network', async (req, res) => {
  try {
    const iconDir = pathModule.join(__dirname, 'public', 'icons', 'network');
    if (!fs.existsSync(iconDir)) {
      return res.status(500).json({ error: 'Icons directory not found' });
    }
    const files = await fsPromises.readdir(iconDir);
    const icons = files.filter(file => file.endsWith('.svg')).map(file => ({
      name: file,
      path: `/networkmap/icons/network/${file}`
    }));
    return res.json(icons);
  } catch (error) {
    console.error('Error reading network icons directory:', error);
    return res.status(500).json({ error: 'Failed to read network icons directory' });
  }
});

app.get('/api/icons/general', async (req, res) => {
  try {
    const iconDir = pathModule.join(__dirname, 'public', 'icons', 'general');
    if (!fs.existsSync(iconDir)) {
      return res.status(500).json({ error: 'Icons directory not found' });
    }
    const files = await fsPromises.readdir(iconDir);
    const icons = files.filter(file => file.endsWith('.svg')).map(file => ({
      name: file,
      path: `/networkmap/icons/general/${file}`
    }));
    return res.json(icons);
  } catch (error) {
    console.error('Error reading general icons directory:', error);
    return res.status(500).json({ error: 'Failed to read general icons directory' });
  }
});

// API routes - handle both /api and /networkmap/api paths
['/api/home-path', '/networkmap/api/home-path'].forEach(routePath => {
  app.get(routePath, (req, res) => {
    try {
      const homePath = os.homedir();
      return res.json({ path: homePath });
    } catch (error) {
      console.error('Error getting home path:', error);
      return res.status(500).json({ error: 'Failed to get home path' });
    }
  });
});

['/api/list-dir', '/networkmap/api/list-dir', '/api/files', '/networkmap/api/files'].forEach(routePath => {
  app.get(routePath, async (req, res) => {
    try {
      const dirPath = decodeURIComponent(req.query.path);

      if (!dirPath) {
        return res.status(400).json({ error: 'Path parameter is required' });
      }

      if (!isSafePath(dirPath)) {
        return res.status(403).json({ error: 'Access to this path is not allowed' });
      }

      if (!fs.existsSync(dirPath)) {
        return res.status(404).json({ error: 'Directory not found' });
      }

      const stats = await safeGetStats(dirPath);
      if (!stats || !stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }

      const items = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const itemsList = await Promise.all(items
        .map(async (item) => {
          const itemPath = pathModule.join(dirPath, item.name);
          const stats = await safeGetStats(itemPath);
          if (!stats) return null;

          return {
            name: item.name,
            isDirectory: item.isDirectory(),
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
          };
        }));

      const validItems = itemsList.filter(item => item !== null);
      return res.json(validItems);
    } catch (error) {
      console.error('Error reading directory:', error);
      return res.status(500).json({ error: 'Failed to read directory contents' });
    }
  });
});

['/api/files', '/networkmap/api/files'].forEach(routePath => {
  app.post(routePath, async (req, res) => {
    try {
      const { path: itemPath, name, type } = req.body;
      const fullPath = pathModule.join(itemPath, name);

      if (!isSafePath(fullPath)) {
        return res.status(403).json({ error: 'Access to this path is not allowed' });
      }

      if (type === 'directory') {
        await fsPromises.mkdir(fullPath, { recursive: true });
      } else {
        await fsPromises.writeFile(fullPath, '');
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error creating item:', error);
      return res.status(500).json({ error: 'Failed to create item' });
    }
  });

  app.delete(routePath, async (req, res) => {
    try {
      const { path: itemPath } = req.body;

      if (!isSafePath(itemPath)) {
        return res.status(403).json({ error: 'Access to this path is not allowed' });
      }

      const stats = await safeGetStats(itemPath);
      if (!stats) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (stats.isDirectory()) {
        await fsPromises.rm(itemPath, { recursive: true, force: true });
      } else {
        await fsPromises.unlink(itemPath);
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting item:', error);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
  });
});

// Load config from file
['/api/load-config', '/networkmap/api/load-config'].forEach(routePath => {
  app.get(routePath, async (req, res) => {
    try {
      const { path } = req.query;
      
      if (!path) {
        return res.status(400).json({ error: 'Path is required' });
      }

      if (!isSafePath(path)) {
        return res.status(403).json({ error: 'Access to this path is not allowed' });
      }

      const stats = await safeGetStats(path);
      if (!stats) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (!stats.isFile()) {
        return res.status(400).json({ error: 'Path is not a file' });
      }

      const content = await fsPromises.readFile(path, 'utf-8');
      let config = {};
      
      try {
        config = JSON.parse(content);
      } catch (e) {
        // If file is empty or invalid JSON, return empty config
        config = { devices: [], connections: [] };
      }

      return res.json(config);
    } catch (error) {
      console.error('Error loading config:', error);
      return res.status(500).json({ error: 'Failed to load config' });
    }
  });
});

// Save config to file
['/api/save-config', '/networkmap/api/save-config'].forEach(routePath => {
  app.post(routePath, async (req, res) => {
    try {
      const { path, config } = req.body;
      
      if (!path || !config) {
        return res.status(400).json({ error: 'Path and config are required' });
      }

      if (!isSafePath(path)) {
        return res.status(403).json({ error: 'Access to this path is not allowed' });
      }

      // Ensure config is valid JSON
      const configString = JSON.stringify(config, null, 2);
      await fsPromises.writeFile(path, configString, 'utf-8');

      return res.json({ success: true });
    } catch (error) {
      console.error('Error saving config:', error);
      return res.status(500).json({ error: 'Failed to save config' });
    }
  });
});

// Helper functions
const isSafePath = (requestedPath) => {
  const homePath = os.homedir();
  const resolvedPath = pathModule.resolve(requestedPath);
  return resolvedPath.startsWith(homePath);
};

const safeGetStats = async (filePath) => {
  try {
    return await fsPromises.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

// Serve static files
app.use('/networkmap/icons', express.static(pathModule.join(__dirname, 'public', 'icons')));
app.use('/networkmap', express.static('dist'));

// Serve index.html for all routes under /networkmap
app.get('/networkmap/*', (req, res) => {
  res.sendFile(pathModule.join(__dirname, 'dist', 'index.html'));
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

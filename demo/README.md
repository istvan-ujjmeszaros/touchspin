# Bootstrap TouchSpin Demos

This directory contains comprehensive demos showcasing Bootstrap TouchSpin's compatibility with different Bootstrap versions.

## 🎯 Available Demos

### Main Demo Hub
- **`index-new.html`** - Main landing page with navigation to all demos
  - Quick demo with auto-detection
  - Feature showcase and technical details
  - Links to version-specific demos

### Version-Specific Demos
- **`bootstrap3.html`** - Bootstrap 3.4.1 compatibility demo
- **`bootstrap4.html`** - Bootstrap 4.6.2 compatibility demo  
- **`bootstrap5.html`** - Bootstrap 5.3.0 compatibility demo

### Legacy Demos
- **`index.html`** - Original Bootstrap 4 demo
- **`index-bs3.html`** - Legacy Bootstrap 3 demo

## 🚀 How to View the Demos

Simply open any HTML file directly in your browser:

```bash
# Double-click any .html file, or open in browser:
demo/index-new.html      # Main demo hub (recommended)
demo/bootstrap3.html     # Bootstrap 3 demo
demo/bootstrap4.html     # Bootstrap 4 demo
demo/bootstrap5.html     # Bootstrap 5 demo
```

The demos use relative paths (`../dist/`) which work perfectly with the `file://` protocol.

## 📱 Demo Features

Each demo showcases:

- **Basic initialization** - Simple TouchSpin setup
- **Styling options** - Prefixes, postfixes, custom button classes
- **Sizing variants** - Small, normal, and large form controls
- **Vertical buttons** - Alternative layout with custom icons
- **Input groups** - Integration with Bootstrap components
- **Advanced features** - Boosters, validation, decimal precision
- **Version detection** - Live display of detected Bootstrap version

## 🔧 Technical Notes

### Auto-Detection
The plugin automatically detects the Bootstrap version and uses the appropriate renderer:
- **Bootstrap 3**: Uses `input-group-btn` and `input-group-addon`
- **Bootstrap 4**: Uses `input-group-prepend`/`input-group-append` with `input-group-text`
- **Bootstrap 5**: Uses simplified structure with direct `input-group-text` elements

### External Dependencies
Each demo loads its respective Bootstrap version and icon libraries from CDN:
- **Bootstrap 3**: Font Awesome 4.7
- **Bootstrap 4**: Font Awesome 5.15.4  
- **Bootstrap 5**: Bootstrap Icons 1.10.5

### File Structure
```
demo/
├── bootstrap3.html          # Bootstrap 3 demo
├── bootstrap4.html          # Bootstrap 4 demo
├── bootstrap5.html          # Bootstrap 5 demo
├── index-new.html           # Main demo hub (start here!)
├── demo.css                 # Demo styling
└── README.md               # This file

../dist/                     # TouchSpin build files (referenced by demos)
├── jquery.bootstrap-touchspin.js
├── jquery.bootstrap-touchspin.css
└── ...
```

## 📦 Version-Specific Builds

Starting with version 4.7.3, Bootstrap TouchSpin provides optimized builds for each Bootstrap version:

### Available Builds
- **Bootstrap 3**: `jquery.bootstrap-touchspin-bs3.js` (~42KB)
- **Bootstrap 4**: `jquery.bootstrap-touchspin-bs4.js` (~43KB)  
- **Bootstrap 5**: `jquery.bootstrap-touchspin-bs5.js` (~41KB)
- **Universal**: `jquery.bootstrap-touchspin.js` (~62KB) - includes all renderers

### Demo File Mapping
- `bootstrap3.html` → Uses BS3 specific build
- `bootstrap4.html` → Uses BS4 specific build  
- `bootstrap5.html` → Uses BS5 specific build
- `index-new.html` → Uses universal build (auto-detection)

### Benefits
1. **Smaller file size** - Only includes renderer for target Bootstrap version
2. **Better performance** - No runtime version detection overhead
3. **Optimized structure** - Tailored HTML for each Bootstrap version

## 🆕 Recent Updates

- ✅ Added version-specific builds for BS3/4/5 (v4.7.3)
- ✅ Updated all demo files to use optimized builds
- ✅ Created comprehensive version-specific demos
- ✅ Added main demo hub with navigation
- ✅ Implemented Bootstrap version auto-detection showcase
- ✅ Added responsive design and modern styling
- ✅ Simplified file structure - just open HTML files directly!

## 🐛 Troubleshooting

### TouchSpin is not a function
- Ensure you've built the project first: `npm run build`
- Check that `dist/` folder contains the build files
- Verify browser allows loading local files (some browsers block file:// requests)

### Version detection not working
- Make sure Bootstrap CSS is loaded before TouchSpin initialization
- Check browser console for any JavaScript errors
- Test with different Bootstrap versions to confirm detection
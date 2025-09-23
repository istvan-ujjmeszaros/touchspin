# TouchSpin Demos

This directory contains comprehensive demos showcasing TouchSpin's compatibility with different Bootstrap versions.

## 🎯 Available Demos

### Main Demo Hub
- **`index-new.html`** - Main landing page with navigation to all demos
  - Feature showcase and technical details
  - Links to version-specific demos

### Version-Specific Demos
- **`bootstrap3.html`** - Bootstrap 3.4.1 compatibility demo
- **`bootstrap4.html`** - Bootstrap 4.6.2 compatibility demo  
- **`bootstrap5.html`** - Bootstrap 5.3.0 compatibility demo

## 🚀 How to View the Demos

Simply open any HTML file directly in your browser:

```bash
# Double-click any .html file, or open in browser:
demo/index-new.html      # Main demo hub (start here!)
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

## 🔧 Technical Notes

### Version-Specific Renderers
Each version uses Bootstrap-specific classes and structure:
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
├── jquery.touchspin-bs3.js
├── jquery.touchspin-bs4.js  
├── jquery.touchspin-bs5.js
├── jquery.touchspin.css
└── ...
```

## 📦 Version-Specific Builds

TouchSpin provides optimized builds for each Bootstrap version:

### Available Builds
- **Bootstrap 3**: `jquery.touchspin-bs3.js` (~35KB)
- **Bootstrap 4**: `jquery.touchspin-bs4.js` (~35KB)  
- **Bootstrap 5**: `jquery.touchspin-bs5.js` (~35KB)

### Demo File Mapping
- `bootstrap3.html` → Uses BS3 specific build
- `bootstrap4.html` → Uses BS4 specific build  
- `bootstrap5.html` → Uses BS5 specific build
- `index-new.html` → Uses BS5 specific build

### Benefits
1. **Smaller file size** - Only includes renderer for target Bootstrap version
2. **Better performance** - No version detection overhead
3. **Optimized structure** - Tailored HTML for each Bootstrap version
4. **Explicit dependencies** - Know exactly which Bootstrap version you're using



## 🐛 Troubleshooting

### TouchSpin is not a function
- Ensure you've built the project first: `yarn build`
- Check that `dist/` folder contains the build files
- Verify browser allows loading local files (some browsers block file:// requests)

### Wrong Bootstrap version styling
- Make sure you're using the correct TouchSpin build for your Bootstrap version
- Bootstrap 3: use `jquery.touchspin-bs3.js`
- Bootstrap 4: use `jquery.touchspin-bs4.js`  
- Bootstrap 5: use `jquery.touchspin-bs5.js`

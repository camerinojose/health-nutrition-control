# App Icon Instructions

## Current Status
- SVG templates have been created in `assets/` folder
- Need to convert to PNG format for Expo/React Native

## Option 1: Online Conversion (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon-template.svg`
3. Set output size to 1024x1024 pixels
4. Download as `icon.png`
5. Place in `mobile/assets/` folder

## Option 2: Using Inkscape (Free Desktop App)
1. Download Inkscape: https://inkscape.org/
2. Open `icon-template.svg`
3. Export as PNG:
   - File → Export PNG Image
   - Set width/height to 1024px
   - Export as `icon.png`
4. Repeat for `adaptive-icon-foreground.svg` → `adaptive-icon.png`

## Option 3: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Convert the SVG to PNG
magick icon-template.svg -resize 1024x1024 icon.png
magick adaptive-icon-foreground.svg -resize 1024x1024 adaptive-icon.png
```

## Option 4: Use Design Software
- **Figma** (Free, web-based): Import SVG, export as PNG
- **Canva** (Free): Import SVG, resize to 1024x1024, download
- **Photoshop/Illustrator**: Open SVG, export as PNG

## After Converting
Once you have `icon.png` (1024x1024), update `app.json`:

```json
"expo": {
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#4CAF50"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#4CAF50"
    }
  }
}
```

## Icon Design Details
- **Colors**: 
  - Primary Green: #4CAF50 (wellness/health theme)
  - Accent Green: #81C784
  - White: #FFFFFF
- **Elements**:
  - Heart shape (health/wellness)
  - Plus symbol (medical/care)
  - Leaf accent (natural/nutrition)
  - App name text

## Recommended Sizes to Generate
- **icon.png**: 1024x1024 (required by App Store/Play Store)
- **adaptive-icon.png**: 1024x1024 (Android foreground)
- **favicon.png**: 48x48 (web)
- **splash.png**: 1284x2778 (iPhone splash screen)

## Quick Alternative - Use Expo's Icon Tool
```bash
cd mobile
npx expo install expo-splash-screen
# This will help generate proper splash screens from your icon
```

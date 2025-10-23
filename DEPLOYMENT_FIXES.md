# Image Deployment Fixes

## Problem
Images were rendering locally but not on deployment due to inconsistent path references.

## Root Cause
- **Mixed image locations**: Images in both `src/assets/` and `public/` folders
- **Absolute path references**: Using `/image.png` which fails when deployed to subdirectories
- **CSS url() with absolute paths**: CSS files can't import JS modules, causing broken references
- **Missing base path configuration**: Vite config didn't specify proper base path

## Changes Made

### 1. Moved Images from `public/` to `src/assets/`
Moved the following images to enable proper import:
- `public/mascot.png` → `src/assets/mascot.png`
- `public/taco.png` → `src/assets/taco.png`
- `public/taco-cloud.png` → `src/assets/taco-cloud.png`
- `public/cartoon-bg.jpg` → `src/assets/cartoon-bg.jpg`

### 2. Updated Component Imports
**File: `src/components/student/ReadingDefenderComponent.jsx`**
- Added imports for mascot, taco, taco-cloud, and cartoon-bg images
- Changed from `src="/mascot.png"` to `src={mascotImg}`
- Applied background images via inline styles with imported variables

**File: `src/components/layout/LandingPage.jsx`**
- Added imports for ScribbieLogoV2 and landingface images
- Fixed incorrect paths like `/src/assets/...` to use imported variables

### 3. Updated CSS Files
**File: `src/components/styles/ReadingDefender.css`**
- Removed `--taco-img: url('/taco.png')` CSS variable
- Removed `background-image: url('/cartoon-bg.jpg')`
- Background images now applied via inline styles in component

### 4. Fixed Public Asset References
**File: `src/page/student/StoryGame.jsx`**
- Changed `/sounds/...` to `${import.meta.env.BASE_URL}sounds/...`
- Changed `/video/...` to `${import.meta.env.BASE_URL}video/...`
- Large media files remain in `public/` but use proper BASE_URL

### 5. Updated Vite Configuration
**File: `vite.config.js`**
- Added `base: './'` for relative paths
- Ensures compatibility with subdirectory deployments

## Best Practices Applied

### ✅ For Images & Small Assets
- Store in `src/assets/`
- Import using ES modules: `import myImg from './assets/myImg.png'`
- Use in JSX: `<img src={myImg} />`
- Vite will hash and optimize these files

### ✅ For Large Media (Video/Audio)
- Keep in `public/` folder
- Reference with `${import.meta.env.BASE_URL}path/to/file`
- These files are served as-is without processing

### ❌ Never Use
- Absolute paths like `/image.png` (breaks in subdirectories)
- Paths like `/src/assets/...` (incorrect, not served by dev server)
- CSS `url()` with absolute paths for dynamic assets

## Testing
1. **Local Development**: Run `npm run dev` - all images should display
2. **Production Build**: Run `npm run build` - check `dist/` folder
3. **Preview Build**: Run `npm run preview` - test production build locally
4. **Deployment**: Deploy and verify all images load correctly

## Files Modified
- `src/components/student/ReadingDefenderComponent.jsx`
- `src/components/layout/LandingPage.jsx`
- `src/components/styles/ReadingDefender.css`
- `src/page/student/StoryGame.jsx`
- `vite.config.js`

## Remaining Public Assets
These files remain in `public/` and are correctly referenced:
- `public/sounds/` (audio files)
- `public/video/` (video files)
- `public/Blimp.png`, `public/heart.png` (not currently used, can be moved or deleted)

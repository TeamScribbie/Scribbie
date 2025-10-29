# 🎵 Audio CORS Issue - SOLUTION

## Problem Identified ✅

Your error: `403 Forbidden + CORS policy blocked`

### Root Causes:

1. **Database has FULL URLs stored:**
   ```
   http://152.42.254.129:8080/audio/76bc44e6-f012-4a83-b7ea-e9f03431487f.mp3
   ```
   
2. **Frontend expects different server:**
   ```
   https://scribbiealpha.serveblog.net
   ```

3. **CORS blocks cross-origin requests** when browser tries to access `152.42.254.129:8080` from `localhost:5173`

## Why This Happened

Your `FileStorageService.java` returns **relative paths**:
```java
return subdirectory + "/" + newFilename;  // Returns: "audio/uuid.mp3"
```

But somehow **full URLs** got saved in the database. This likely happened when:
- You uploaded files while backend was running on `152.42.254.129:8080`
- Some code somewhere prepended the full server URL

## Solution Options

### Option 1: Quick Fix - Update Frontend Config (TEMPORARY) ✅

**I already applied this:**

```javascript
// In apiConfig.js
export const API_BASE_URL = 'http://152.42.254.129:8080/api';
export const MEDIA_BASE_URL = 'http://152.42.254.129:8080';
```

**This will work for now but has issues:**
- Only works from `localhost:5173` (already in CORS allowed origins)
- Won't work from `https://scribbiealphav1.vercel.app` (needs HTTP→HTTPS)
- Not secure (HTTP not HTTPS)

### Option 2: Fix Database + Add Resource Controller (RECOMMENDED) 🎯

#### Step 1: Clean Database

Run this SQL to fix existing records:

```sql
-- Fix Question audio paths
UPDATE question 
SET question_sound_url = REPLACE(question_sound_url, 'http://152.42.254.129:8080/', '')
WHERE question_sound_url LIKE 'http://152.42.254.129:8080/%';

-- Fix Choice audio paths  
UPDATE choice
SET audio_path = REPLACE(audio_path, 'http://152.42.254.129:8080/', '')
WHERE audio_path LIKE 'http://152.42.254.129:8080/%';

-- Fix Challenge Question audio paths
UPDATE challenge_question
SET question_sound_url = REPLACE(question_sound_url, 'http://152.42.254.129:8080/', '')
WHERE question_sound_url LIKE 'http://152.42.254.129:8080/%';

-- Fix Challenge Choice audio paths
UPDATE challenge_choice
SET audio_path = REPLACE(audio_path, 'http://152.42.254.129:8080/', '')
WHERE audio_path LIKE 'http://152.42.254.129:8080/%';
```

#### Step 2: Verify SecurityConfig CORS for Static Files

Your `SecurityConfig.java` already has:
```java
.requestMatchers(HttpMethod.GET, "/images/**", "/audio/**").permitAll()
```

This is correct ✅

#### Step 3: Create Dedicated Resource Controller with CORS

Add this new controller:

```java
package Scribbie.Server.Controller;

import Scribbie.Server.Service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "https://scribbiealphav1.vercel.app"}, maxAge = 3600)
public class ResourceController {

    private final FileStorageService fileStorageService;

    public ResourceController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/audio/{filename}")
    public ResponseEntity<Resource> serveAudio(@PathVariable String filename) {
        Resource file = fileStorageService.loadFileAsResource("audio/" + filename);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(file);
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        Resource file = fileStorageService.loadFileAsResource("images/" + filename);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(file);
    }
}
```

#### Step 4: Update Frontend Config for Production

```javascript
// For Production
export const API_BASE_URL = 'https://scribbiealpha.serveblog.net/api';
export const MEDIA_BASE_URL = 'https://scribbiealpha.serveblog.net';
```

### Option 3: Setup Proper HTTPS Reverse Proxy (BEST FOR PRODUCTION) 🚀

Use nginx or Apache to:
1. Serve `https://scribbiealpha.serveblog.net`
2. Proxy `/api/**` to `http://152.42.254.129:8080/api`
3. Proxy `/audio/**` and `/images/**` to `http://152.42.254.129:8080`
4. Handle CORS at proxy level
5. Add SSL certificate

## Testing After Fix

### Test 1: Check Console Logs
After applying Option 1 (already done):
```javascript
🎵 CONSTRUCTED URLs:
  Question Audio: http://152.42.254.129:8080/audio/76bc44e6-f012-4a83-b7ea-e9f03431487f.mp3
✅ Question audio HTTP 200: http://...
```

If you see `200` instead of `403`, it works!

### Test 2: Direct URL Test
Open in browser:
```
http://152.42.254.129:8080/audio/76bc44e6-f012-4a83-b7ea-e9f03431487f.mp3
```

Should play audio, not return 403.

## Current Status

✅ **Fixed for localhost development**
- Updated `MEDIA_BASE_URL` to match backend
- Should work from `localhost:5173`

❌ **Still broken for production**
- Vercel app still points to `https://scribbiealpha.serveblog.net`
- HTTP vs HTTPS mismatch
- Need to implement Option 2 or 3

## Next Steps

1. **Test now:** Audio should work from localhost
2. **For production:** Choose Option 2 or 3
3. **Clean database:** Run SQL scripts to fix paths
4. **Re-upload files:** Or use migration script

## Why CORS is Blocking

```
Browser Security Model:
├─ Frontend: http://localhost:5173
├─ Trying to access: http://152.42.254.129:8080/audio/file.mp3
├─ Browser: "These are different origins!"
├─ Browser asks backend: "Do you allow localhost:5173?"
└─ Backend: "403 Forbidden" (CORS not configured for static files)
```

**Solution:** ResourceController with explicit CORS headers solves this!

---

**Current Quick Fix Applied:** ✅
**Permanent Fix Needed:** Option 2 or 3

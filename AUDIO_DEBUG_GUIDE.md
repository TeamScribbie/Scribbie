# Audio Debugging Guide 🎵

## The Problem
Your uploaded sounds are not playing in the games. This could be a **code issue** or a **networking/backend issue**.

## How Audio Flow Works in Your App

1. **Backend Upload**: Teacher uploads audio files → Server stores them
2. **Backend Returns Paths**: Server returns paths like `/uploads/audio/sound.mp3`
3. **Frontend Constructs URLs**: 
   - For WordFeast: `MEDIA_BASE_URL + questionSoundUrl` or `MEDIA_BASE_URL + choice.audioPath`
   - For Memory Game: `MEDIA_BASE_URL + choice.audioPath`
4. **Browser Plays**: `new Audio(fullUrl).play()`

## Current Configuration

**Your MEDIA_BASE_URL**: `https://scribbiealpha.serveblog.net` (no trailing slash)

**URL Construction Example**:
```javascript
// If backend returns: "/uploads/audio/test.mp3"
// Frontend constructs: "https://scribbiealpha.serveblog.net/uploads/audio/test.mp3"
```

## Step-by-Step Debugging

### Step 1: Check What Backend is Sending ✅

**Action**: Open browser console (F12) when playing a game and look for:
```
WordFeastGame - Transformed gameData: {...}
```

**What to check**:
1. Does `question.soundSrc` have a value?
2. Do `choices[].soundSrc` have values?
3. Are they full URLs or just paths?

**Expected**:
```javascript
{
  question: {
    word: "cat",
    soundSrc: "https://scribbiealpha.serveblog.net/uploads/audio/cat.mp3"  // ✅ Good
    // OR
    soundSrc: null  // ❌ Backend didn't send audio path!
  },
  choices: [
    {
      word: "dog",
      soundSrc: "https://scribbiealpha.serveblog.net/uploads/audio/dog.mp3"  // ✅ Good
    }
  ]
}
```

### Step 2: Test URL Directly 🌐

**Action**: 
1. Copy one of the `soundSrc` URLs from console
2. Paste it directly in browser address bar
3. Press Enter

**Results**:
- ✅ **Audio plays/downloads**: URLs are correct, code issue likely
- ❌ **404 Not Found**: Files not on server or path is wrong
- ❌ **403 Forbidden**: CORS/permission issue
- ❌ **Connection refused**: Server not accessible

### Step 3: Check Network Tab 📡

**Action**:
1. Open DevTools → Network tab
2. Play the game
3. Look for audio file requests (filter by "media" or search for ".mp3", ".ogg", ".wav")

**What to check**:
- Are audio requests being made?
- What's the status code? (200 = OK, 404 = Not Found, 403 = Forbidden)
- Click on failed request to see full URL and error

### Step 4: Check Backend Response Raw Data 🔍

**Action**: Add this temporarily to `ActivityPage.jsx` line 51 (after getting data):

```javascript
console.log("🎵 RAW BACKEND DATA:", JSON.stringify(data, null, 2));
console.log("🎵 First Question:", data.questions?.[0]);
console.log("🎵 First Choice:", data.questions?.[0]?.choices?.[0]);
```

**What to check**:
- Is `questionSoundUrl` present and not null?
- Is `audioPath` present in choices and not null?
- What format is it in? (e.g., "/uploads/...", "uploads/...", full URL?)

## Common Issues and Solutions

### Issue 1: Backend Returns `null` for Audio Paths ❌
**Symptoms**: `soundSrc: null` in console logs
**Cause**: Audio files weren't saved properly on backend
**Solution**: Check backend file upload logic

### Issue 2: Wrong Path Format ❌
**Symptoms**: URL looks like `https://scribbiealpha.serveblog.net//uploads/...` (double slash)
**Cause**: Backend returns path with leading slash, frontend adds another
**Solution**: Backend should return path WITHOUT leading slash OR frontend needs better handling

### Issue 3: Files Not Accessible (404) ❌
**Symptoms**: Direct URL test returns 404
**Cause**: Files not uploaded to correct directory on server
**Solution**: Check server file storage location matches URL paths

### Issue 4: CORS Errors ❌
**Symptoms**: Console shows CORS policy errors
**Cause**: Server not configured to serve media files with proper headers
**Solution**: Configure Spring Boot to allow media file access

### Issue 5: Wrong File Extension ❌
**Symptoms**: Files exist but won't play
**Cause**: Backend saved as .mp3 but database says .ogg (or vice versa)
**Solution**: Ensure file extension matches actual file type

## Quick Test Code

Add this to `WordFeastGame.jsx` after line 35:

```javascript
console.log("=== AUDIO DEBUG ===");
console.log("Question audio:", data.question.soundSrc);
console.log("Choice audios:", data.choices.map(c => ({ word: c.word, audio: c.soundSrc })));

// Test if URLs are accessible
if (data.question.soundSrc) {
    console.log("Testing question audio...");
    fetch(data.question.soundSrc, { method: 'HEAD' })
        .then(r => console.log("✅ Question audio accessible:", r.status))
        .catch(e => console.error("❌ Question audio NOT accessible:", e));
}
```

## Expected Working Example

```javascript
// In console, you should see:
{
  question: {
    word: "cat",
    soundSrc: "https://scribbiealpha.serveblog.net/uploads/audio/1234-cat.mp3"
  },
  choices: [
    {
      id: 1,
      word: "c",
      isCorrect: true,
      soundSrc: "https://scribbiealpha.serveblog.net/uploads/audio/5678-c.mp3"
    },
    // ... more choices
  ]
}
```

## Next Steps

1. ✅ Run Step 1 first - Check console logs
2. ✅ If `soundSrc` is `null` → **BACKEND ISSUE** (files not saved/paths not returned)
3. ✅ If `soundSrc` exists but audio doesn't play → Run Step 2 (test URL directly)
4. ✅ If URL test fails → **NETWORKING/SERVER ISSUE** (files not accessible)
5. ✅ If URL test succeeds → **CODE ISSUE** (audio player code problem)

After checking, report back what you found! 🔍

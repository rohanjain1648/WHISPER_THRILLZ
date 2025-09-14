# Spotify Integration Setup Guide

This guide will help you set up Spotify integration for the Whisper Walls platform.

## Prerequisites

- A Spotify account (free or premium)
- Access to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details:
   - **App Name**: Whisper Walls
   - **App Description**: A platform for emotional connection through music and location-based messaging
   - **Website**: Your domain (e.g., https://whisperwalls.com)
   - **Redirect URI**: `http://localhost:5173/auth/spotify/callback` (for development)
5. Accept the Terms of Service and click "Create"

## Step 2: Configure App Settings

1. In your newly created app, go to "Settings"
2. Note down your **Client ID** - you'll need this for the frontend
3. Click "Show Client Secret" and note down your **Client Secret** - you'll need this for the backend
4. Add redirect URIs:
   - Development: `http://localhost:5173/auth/spotify/callback`
   - Production: `https://yourdomain.com/auth/spotify/callback`

## Step 3: Configure Scopes

The Whisper Walls app requires the following Spotify scopes:

- `user-read-private` - Read user profile data
- `user-read-email` - Read user email address
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `playlist-modify-public` - Create and modify public playlists
- `playlist-modify-private` - Create and modify private playlists
- `user-top-read` - Read user's top artists and tracks
- `user-read-recently-played` - Read recently played tracks
- `user-library-read` - Read user's saved tracks

These scopes are automatically requested during the OAuth flow.

## Step 4: Environment Configuration

### Frontend (.env)

Create a `.env` file in the frontend directory with:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/auth/spotify/callback
```

### Backend (.env)

Create a `.env` file in the backend directory with:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5173/auth/spotify/callback
```

## Step 5: Test the Integration

1. Start your development servers (frontend and backend)
2. Navigate to the Playlists page in Whisper Walls
3. Click "Connect with Spotify"
4. You should be redirected to Spotify's authorization page
5. Grant the requested permissions
6. You should be redirected back to Whisper Walls with a successful connection

## API Endpoints

The backend should implement the following Spotify-related endpoints:

### Authentication
- `POST /api/spotify/auth/token` - Exchange authorization code for tokens
- `POST /api/spotify/auth/refresh` - Refresh access token
- `POST /api/spotify/disconnect` - Disconnect Spotify account
- `GET /api/spotify/status` - Check connection status

### User Data
- `GET /api/spotify/me` - Get current user profile

### Playlists
- `GET /api/spotify/playlists` - Get user playlists
- `POST /api/spotify/playlists` - Create new playlist
- `POST /api/spotify/playlists/:id/tracks` - Add tracks to playlist
- `DELETE /api/spotify/playlists/:id/tracks` - Remove tracks from playlist

### Music Discovery
- `POST /api/spotify/recommendations` - Get mood-based recommendations
- `GET /api/spotify/search` - Search for tracks
- `POST /api/spotify/audio-features` - Get audio features for tracks

## Mood-to-Music Mapping

The system maps emotional states to Spotify audio features:

### Emotion Mappings

| Emotion | Energy | Valence | Danceability | Acousticness | Tempo |
|---------|--------|---------|--------------|--------------|-------|
| Joy | High (0.7-1.0) | High (0.7-1.0) | High (0.6-1.0) | Low (0.0-0.4) | Fast (120-180) |
| Sadness | Low (0.0-0.4) | Low (0.0-0.3) | Low (0.0-0.4) | High (0.6-1.0) | Slow (60-100) |
| Anger | High (0.8-1.0) | Low (0.0-0.4) | Medium (0.4-0.7) | Low (0.0-0.3) | Fast (130-200) |
| Fear | Medium (0.3-0.6) | Low (0.0-0.4) | Low (0.0-0.4) | Medium (0.3-0.7) | Variable |
| Trust | Medium (0.4-0.7) | High (0.6-0.9) | Medium (0.4-0.7) | Medium (0.3-0.7) | Moderate (90-130) |
| Anticipation | High (0.6-0.9) | High (0.5-0.8) | High (0.5-0.8) | Low (0.0-0.4) | Fast (110-160) |

### Sentiment Adjustments

- **Positive Sentiment (>0.3)**: Increase valence and energy
- **Negative Sentiment (<-0.3)**: Decrease valence, adjust energy based on intensity
- **Neutral Sentiment (-0.3 to 0.3)**: Balanced audio features

### Intensity Modifiers

- **High Intensity (>0.7)**: Increase energy and tempo
- **Low Intensity (<0.3)**: Decrease energy and tempo, increase acousticness

## Rate Limiting

Spotify API has rate limits:
- **Web API**: 100 requests per minute per user
- **Authorization**: No specific limit, but avoid excessive requests

Implement proper rate limiting and caching in your backend to avoid hitting these limits.

## Error Handling

Common Spotify API errors and how to handle them:

### 401 Unauthorized
- Token expired: Refresh the access token
- Invalid token: Re-authenticate the user

### 403 Forbidden
- Insufficient scope: Request additional permissions
- Premium required: Inform user about premium features

### 429 Too Many Requests
- Rate limit exceeded: Implement exponential backoff
- Cache responses to reduce API calls

### 404 Not Found
- Playlist/track not found: Handle gracefully with user feedback

## Security Considerations

1. **Never expose Client Secret in frontend code**
2. **Use HTTPS in production**
3. **Implement CSRF protection with state parameter**
4. **Store tokens securely (HTTP-only cookies recommended)**
5. **Implement token refresh logic**
6. **Validate all user inputs**
7. **Use secure session management**

## Production Deployment

1. Update redirect URIs in Spotify app settings
2. Set production environment variables
3. Ensure HTTPS is enabled
4. Configure proper CORS settings
5. Implement monitoring and logging
6. Set up error tracking (e.g., Sentry)

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that the redirect URI in your Spotify app matches exactly
   - Ensure no trailing slashes or extra parameters

2. **"Invalid client"**
   - Verify your Client ID and Client Secret are correct
   - Check that you're using the right environment variables

3. **"Insufficient scope"**
   - Ensure all required scopes are requested during authorization
   - User may need to re-authorize with additional scopes

4. **"Token expired"**
   - Implement automatic token refresh
   - Handle 401 errors by refreshing tokens

### Debug Mode

Enable debug logging by setting:
```env
VITE_LOG_LEVEL=debug
```

This will log all Spotify API requests and responses to the console.

## Support

For additional help:
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web API Console](https://developer.spotify.com/console/)
- [Spotify Community Forum](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)
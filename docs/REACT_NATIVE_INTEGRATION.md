# React Native / Expo Integration Guide

This guide explains how to wrap the LWSRH web app in a React Native WebView with proper KingsChat OAuth support.

## The Problem

WebViews don't share cookies with the native app, and OAuth popups don't work properly. This integration solves it by:

1. Detecting when running in React Native WebView
2. Handling KingsChat OAuth natively in Expo
3. Injecting auth tokens back into the WebView

## Expo App Setup

### 1. Install Dependencies

```bash
npx expo install react-native-webview expo-auth-session expo-web-browser expo-crypto
```

### 2. Create the WebView Component

```tsx
// App.tsx or screens/WebViewScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Your KingsChat OAuth config
const KINGSCHAT_CLIENT_ID = '331c9eda-a130-4bb8-9a00-9231a817207d';
const KINGSCHAT_AUTH_URL = 'https://accounts.kingsch.at/oauth/authorize';
const KINGSCHAT_TOKEN_URL = 'https://accounts.kingsch.at/oauth/token';

// Your web app URL
const WEB_APP_URL = 'https://www.loveworldsingersrehearsalhubportal.org/'; 

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle KingsChat OAuth natively
  const handleKingsChatOAuth = async (clientId: string, scopes: string[]) => {
    try {
      // Create OAuth request
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'lwsrh', // Your app scheme
        path: 'auth/callback'
      });

      const authRequest = new AuthSession.AuthRequest({
        clientId,
        scopes,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      // Open browser for OAuth
      const result = await authRequest.promptAsync({
        authorizationEndpoint: KINGSCHAT_AUTH_URL,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResponse = await fetch(KINGSCHAT_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: result.params.code,
            client_id: clientId,
            redirect_uri: redirectUri,
          }).toString(),
        });

        const tokens = await tokenResponse.json();

        if (tokens.access_token) {
          // Inject tokens into WebView
          const tokenData = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresInMillis: tokens.expires_in * 1000,
          };

          webViewRef.current?.injectJavaScript(`
            (function() {
              // Store tokens in localStorage
              localStorage.setItem('kingschat_access_token', '${tokenData.accessToken}');
              localStorage.setItem('kingschat_refresh_token', '${tokenData.refreshToken}');
              localStorage.setItem('kingschat_token_expiry', '${Date.now() + tokenData.expiresInMillis}');
              
              // Call the callback function if it exists
              if (window.onNativeKingsChatAuth) {
                window.onNativeKingsChatAuth(${JSON.stringify(tokenData)});
              }
              
              console.log('📱 Native OAuth tokens injected');
            })();
            true;
          `);
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled - notify web app
        webViewRef.current?.injectJavaScript(`
          (function() {
            if (window.KingsChatAuthService && window.KingsChatAuthService.cancelNativeAuth) {
              window.KingsChatAuthService.cancelNativeAuth();
            }
            console.log('📱 Native OAuth cancelled');
          })();
          true;
        `);
      }
    } catch (error) {
      console.error('Native OAuth error:', error);
      // Notify web app of error
      webViewRef.current?.injectJavaScript(`
        (function() {
          if (window.KingsChatAuthService && window.KingsChatAuthService.cancelNativeAuth) {
            window.KingsChatAuthService.cancelNativeAuth();
          }
          console.log('📱 Native OAuth error');
        })();
        true;
      `);
    }
  };

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📱 Message from WebView:', message.type);

      switch (message.type) {
        case 'KINGSCHAT_LOGIN_REQUEST':
          handleKingsChatOAuth(
            message.data?.clientId || KINGSCHAT_CLIENT_ID,
            message.data?.scopes || ['profile', 'email']
          );
          break;

        case 'OPEN_EXTERNAL_URL':
          if (message.data?.url) {
            WebBrowser.openBrowserAsync(message.data.url);
          }
          break;

        case 'SHARE_REQUEST':
          // Handle native share
          // You can use expo-sharing here
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // JavaScript to inject before page loads
  const injectedJavaScriptBeforeContentLoaded = `
    (function() {
      // Mark as native app
      window.IS_NATIVE_APP = true;
      
      // Prevent zoom on input focus (iOS)
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      document.head.appendChild(meta);
      
      console.log('📱 Native app bridge initialized');
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        
        // Enable JavaScript and DOM storage
        javaScriptEnabled={true}
        domStorageEnabled={true}
        
        // Inject native app flag before page loads
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        
        // Handle messages from web app
        onMessage={handleMessage}
        
        // Track navigation state for back button
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        
        // Allow mixed content (if needed)
        mixedContentMode="compatibility"
        
        // Enable cookies
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        
        // Pull to refresh (optional)
        pullToRefreshEnabled={true}
        
        // Media playback
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        
        // File access (for uploads)
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        
        // User agent (helps identify native app on server if needed)
        userAgent="LWSRH-NativeApp/1.0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // Safe area for iOS
  },
  webview: {
    flex: 1,
  },
});
```

### 3. Configure app.json

```json
{
  "expo": {
    "name": "LWSRH",
    "slug": "lwsrh",
    "scheme": "lwsrh",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#7c3aed"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.lwsrh",
      "infoPlist": {
        "NSCameraUsageDescription": "Used for profile photos and QR scanning",
        "NSPhotoLibraryUsageDescription": "Used for uploading profile photos"
      }
    },
    "android": {
      "package": "com.yourcompany.lwsrh",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#7c3aed"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## How the Flow Works

### Browser/PWA Flow (unchanged):
1. User clicks "Login with KingsChat"
2. `KingsChatAuthService.login()` opens popup via SDK
3. User authenticates in popup
4. Tokens stored in localStorage
5. User redirected to home

### React Native Flow (new):
1. User clicks "Login with KingsChat"
2. `KingsChatAuthService.login()` detects `window.IS_NATIVE_APP`
3. Sends `KINGSCHAT_LOGIN_REQUEST` message to React Native
4. React Native opens native browser for OAuth
5. User authenticates
6. React Native exchanges code for tokens
7. React Native injects tokens into WebView via `window.onNativeKingsChatAuth()`
8. Web app stores tokens and continues normally

## Testing

### Test in Browser (should work as before):
```bash
npm run dev
# Open http://localhost:3000/auth
# Click "Login with KingsChat" - should open popup
```

### Test Native Detection:
Open browser console and run:
```javascript
window.IS_NATIVE_APP = true;
// Now KingsChat login will try to use native bridge
```

## Troubleshooting

### OAuth not working in WebView
- Make sure `injectedJavaScriptBeforeContentLoaded` runs before page loads
- Check that `window.IS_NATIVE_APP` is set to `true`
- Verify the redirect URI matches your app scheme

### Tokens not persisting
- Ensure `domStorageEnabled={true}` on WebView
- Check that localStorage is accessible in WebView

### Back button not working (Android)
- The `BackHandler` listener handles this
- Make sure `canGoBack` state is being updated

## Security Notes

1. Never expose sensitive tokens in logs
2. Use HTTPS for your web app URL
3. Validate tokens on your backend
4. Consider token encryption for extra security

import { NextResponse } from 'next/server';
import https from 'https';

const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || 'a1f444fa-ea50-47cf-ba2b-232d0b46d1f5';

async function exchangeCodeForTokens(code: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      grant_type: 'code',
      client_id: KINGSCHAT_CLIENT_ID,
      code: code,
    });

    const options = {
      hostname: 'connect.kingsch.at',
      port: 443,
      path: '/developer/api/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse token response JSON: ${body}`));
          }
        } else {
          reject(new Error(`Token exchange failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

function generateResponseHtml(tokens: any, origin: string | null) {
  const { access_token, refresh_token, expires_in_millis } = tokens;

  if (origin === 'mobile' || origin === 'mobile-flow') {
    const deepLink = `rehearsalhub://kingschat-callback?access_token=${access_token}&refresh_token=${refresh_token || ''}&expires_in=${expires_in_millis || ''}`;
    return `
      <html>
        <head>
          <title>Redirecting...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0c0e; color: #fff; }
            .loader { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #7c3aed; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            p { font-size: 16px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Redirecting back to Rehearsal Hub...</p>
          <script>
            setTimeout(function() {
              window.location.href = "${deepLink}";
            }, 300);
          </script>
        </body>
      </html>
    `;
  }

  // Web Flow
  return `
    <html>
      <head>
        <title>Authenticated</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0c0e; color: #fff; }
          p { font-size: 16px; font-weight: 500; }
        </style>
      </head>
      <body>
        <p>Authentication successful! Returning to app...</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'kingschat_auth_success',
              accessToken: "${access_token}",
              refreshToken: "${refresh_token}",
              expiresInMillis: ${expires_in_millis}
            }, window.location.origin);
            window.close();
          } else {
            localStorage.setItem('kingschat_access_token', "${access_token}");
            window.location.href = '/auth';
          }
        </script>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let code = searchParams.get('code');
    let origin = searchParams.get('origin');

    if (!code) {
      try {
        const body = await request.json();
        code = body?.code;
        origin = body?.origin;
      } catch (e) {
        // Ignored: Body already read or not JSON
      }
    }

    if (!code) {
      try {
        const formData = await request.formData();
        code = formData.get('code') as string;
        origin = formData.get('origin') as string;
      } catch (e) {
        // Ignored: Body already read or not form-data
      }
    }

    if (!code) {
      return new NextResponse('Authorization code is missing', { status: 400 });
    }

    const tokens = await exchangeCodeForTokens(code);
    const html = generateResponseHtml(tokens, origin);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('KingsChat POST Callback Error:', error);
    return new NextResponse(`Authentication Error: ${error.message}`, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const origin = searchParams.get('origin');

    if (!code) {
      return new NextResponse('Authorization code is missing', { status: 400 });
    }

    const tokens = await exchangeCodeForTokens(code);
    const html = generateResponseHtml(tokens, origin);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('KingsChat GET Callback Error:', error);
    return new NextResponse(`Authentication Error: ${error.message}`, { status: 500 });
  }
}

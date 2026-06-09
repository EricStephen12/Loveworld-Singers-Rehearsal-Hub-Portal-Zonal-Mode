import { NextResponse } from 'next/server';

const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d';

async function exchangeCodeForTokens(code: string) {
  const tokenResponse = await fetch('https://connect.kingsch.at/developer/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'code',
      client_id: KINGSCHAT_CLIENT_ID,
      code: code,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  return await tokenResponse.json();
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
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      // Handle URL-encoded form POST
      const formData = await request.formData();
      body = {
        code: formData.get('code'),
        origin: formData.get('origin'),
      };
    }

    const { code, origin } = body;
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

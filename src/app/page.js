'use client'
import env from "./_utilities/env";

export default function Home() {
  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: env.twitchClientId,
      redirect_uri: `${window.location.origin}/api/twitch/callback`,
      response_type: 'code',
      scope: 'user:read:email'
    })

    window.location.href = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
  }

  return (
    <div>
      <div>{env.siteName}</div>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Login with Twitch
      </button>
    </div>
  );
}
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Laravel Reverb, configured via the Vite env vars below. If Reverb is not
// running locally, Echo will simply fail to connect and every page that uses
// it (Admin Live Tracking, Commuter Live Buses) already falls back to
// periodic polling of the latest-locations endpoints.
try {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} catch (e) {
    // Real-time is a progressive enhancement; polling fallback covers this.
    console.warn('Echo/Reverb not available, relying on polling fallback.', e);
}

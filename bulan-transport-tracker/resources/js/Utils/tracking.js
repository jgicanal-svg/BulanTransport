// Centralized status-derivation helper so components never hardcode magic
// thresholds. Backend already sends thresholds where relevant (see
// admin dashboard/live-tracking props); this mirrors that logic for any
// client-side recompute between polls.
export function deriveStatus(recordedAt, thresholds) {
    if (!recordedAt) return 'INACTIVE';
    const ageSeconds = (Date.now() - new Date(recordedAt).getTime()) / 1000;

    if (ageSeconds <= thresholds.live_seconds) return 'LIVE';
    if (ageSeconds <= thresholds.stale_seconds) return 'STALE';
    return 'INACTIVE';
}

export function formatRelativeTime(dateString) {
    if (!dateString) return 'Never';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

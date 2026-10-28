import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import DriverLayout from '@/Layouts/DriverLayout';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import DangerButton from '@/Components/UI/DangerButton';
import ConfirmModal from '@/Components/UI/ConfirmModal';
import StatusBadge from '@/Components/UI/StatusBadge';
import EmptyState from '@/Components/UI/EmptyState';
import { useToast } from '@/Components/UI/ToastProvider';
import { AlertTriangle, MapPin, Wifi, WifiOff } from 'lucide-react';

// Web Limitation (documented, not hidden): this page only reliably transmits
// GPS while it stays open and active on the driver's phone. Closing the
// browser or letting the OS suspend the tab will pause updates - Wake Lock
// is used only as a progressive enhancement, never a guarantee.
export default function Tracking({ assignment, activeTrip, directionName }) {
    const [permission, setPermission] = useState('unknown');
    const [tracking, setTracking] = useState(!!activeTrip);
    const [lastUpdate, setLastUpdate] = useState(null); // successful server acknowledgement
    const [lastGpsFix, setLastGpsFix] = useState(null); // device-provided timestamp
    const [accuracy, setAccuracy] = useState(null);
    const [coords, setCoords] = useState(null);
    const [sendState, setSendState] = useState('idle');
    const [gpsError, setGpsError] = useState(null);
    const [confirmStart, setConfirmStart] = useState(false);
    const [confirmStop, setConfirmStop] = useState(false);
    const [secondsToSend, setSecondsToSend] = useState(5);
    const watchIdRef = useRef(null);
    const heartbeatRef = useRef(null);
    const clockRef = useRef(null);
    const wakeLockRef = useRef(null);
    const latestPositionRef = useRef(null);
    const gpsRequestInFlightRef = useRef(false);
    const nextSendAtRef = useRef(Date.now() + 5000);
    const sendingRef = useRef(false);
    const runningRef = useRef(false);
    const { push } = useToast();

    const SEND_INTERVAL_MS = 5000;
    // The server rejects positions older than TRACKING_MAX_POINT_AGE (120s by default).
    // A cached GPS fix retains its original recorded_at; never label it a new GPS fix.
    const MAX_CACHED_FIX_AGE_MS = 60000;

    const receivePosition = (position) => {
        if (!runningRef.current || !position?.coords) return;
        const previous = latestPositionRef.current;
        if (previous && position.timestamp < previous.timestamp) return;
        latestPositionRef.current = position;
        setPermission('granted');
        setLastGpsFix(new Date(position.timestamp));
        setAccuracy(position.coords.accuracy);
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsError(null);
    };

    const reportGpsError = (error) => {
        if (!runningRef.current) return;
        if (error.code === 1) {
            setPermission('denied');
            setGpsError('Location permission denied. Enable location access to continue tracking.');
        } else if (!latestPositionRef.current) {
            setGpsError('Waiting for GPS location. Enable device location services and try moving outdoors.');
        }
    };

    const sendLatest = async () => {
        if (!runningRef.current || sendingRef.current) return;
        const position = latestPositionRef.current;
        if (!position || Date.now() - position.timestamp > MAX_CACHED_FIX_AGE_MS) {
            setSendState('waiting-gps');
            setGpsError('Waiting for a fresh GPS fix. No outdated position is being transmitted.');
            return;
        }
        if (!navigator.onLine) {
            setSendState('error');
            setGpsError('No internet connection. Tracking will retry when reconnected.');
            return;
        }

        sendingRef.current = true;
        setSendState('sending');
        const { latitude, longitude, accuracy: acc, speed, heading, altitude } = position.coords;
        try {
            await axios.post('/driver/tracking/location', {
                latitude, longitude, accuracy: acc,
                speed: speed ?? null, heading: heading ?? null, altitude: altitude ?? null,
                recorded_at: new Date(position.timestamp).toISOString(),
            }, { headers: { Accept: 'application/json' }, timeout: 10000 });
            if (!runningRef.current) return;
            setLastUpdate(new Date());
            setSendState('ok');
            setGpsError(null);
        } catch (error) {
            if (!runningRef.current) return;
            setSendState('error');
            setGpsError(
                error?.response?.data?.errors?.rate_limit?.[0] ??
                error?.response?.data?.message ??
                'Unable to send GPS data. Will retry automatically.'
            );
        } finally {
            sendingRef.current = false;
        }
    };

    const requestFreshGps = () => {
        if (!runningRef.current || gpsRequestInFlightRef.current) return;
        gpsRequestInFlightRef.current = true;
        navigator.geolocation.getCurrentPosition(
            (position) => { gpsRequestInFlightRef.current = false; receivePosition(position); },
            (error) => { gpsRequestInFlightRef.current = false; reportGpsError(error); },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
        );
    };

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator && runningRef.current && !wakeLockRef.current) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
        } catch (_) { /* Optional; unavailable on some devices/browsers. */ }
    };

    const stopWatch = () => {
        runningRef.current = false;
        if (heartbeatRef.current !== null) window.clearInterval(heartbeatRef.current);
        if (clockRef.current !== null) window.clearInterval(clockRef.current);
        heartbeatRef.current = null;
        clockRef.current = null;
        if (watchIdRef.current !== null && 'geolocation' in navigator) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = null;
        wakeLockRef.current?.release?.();
        wakeLockRef.current = null;
    };

    useEffect(() => {
        if (!tracking) return undefined;
        if (!('geolocation' in navigator)) {
            setPermission('unavailable');
            setGpsError('This browser does not support location tracking.');
            return undefined;
        }

        runningRef.current = true;
        latestPositionRef.current = null;
        nextSendAtRef.current = Date.now() + SEND_INTERVAL_MS;
        watchIdRef.current = navigator.geolocation.watchPosition(
            receivePosition, reportGpsError,
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
        requestFreshGps();
        requestWakeLock();

        // Independently send the last available GPS position every five seconds,
        // including while stationary; obtaining a new fix is NOT a prerequisite.
        heartbeatRef.current = window.setInterval(() => {
            nextSendAtRef.current = Date.now() + SEND_INTERVAL_MS;
            sendLatest();
            requestFreshGps();
        }, SEND_INTERVAL_MS);
        clockRef.current = window.setInterval(() => {
            setSecondsToSend(Math.max(0, Math.ceil((nextSendAtRef.current - Date.now()) / 1000)));
        }, 1000);

        const onOnline = () => { requestFreshGps(); sendLatest(); };
        const onOffline = () => { setSendState('error'); setGpsError('Internet connection lost; awaiting reconnection.'); };
        const onVisible = () => {
            if (document.visibilityState === 'visible') { requestFreshGps(); requestWakeLock(); sendLatest(); }
        };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            stopWatch();
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            document.removeEventListener('visibilitychange', onVisible);
        };
        // The tracking lifecycle is bound to the trip, not each React render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracking]);

    const doStart = () => {
        router.post('/driver/tracking/start', {}, {
            onSuccess: () => { setTracking(true); push({ type: 'success', message: 'Trip started. Tracking is now active.' }); },
        });
        setConfirmStart(false);
    };

    const doStop = () => {
        setTracking(false);

        router.post('/driver/tracking/stop', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSendState('idle');
                push({ type: 'success', message: 'Trip ended. Tracking stopped.' });
            },
            onError: () => {
                setTracking(true);
                push({ type: 'error', message: 'The trip could not be ended. Tracking has resumed.' });
            },
        });

        setConfirmStop(false);
    };

    if (!assignment) {
        return (
            <DriverLayout title="Tracking">
                <Head title="Tracking" />
                <EmptyState title="No active assignment" description="You need an active bus/route assignment before you can start tracking." />
            </DriverLayout>
        );
    }

    return (
        <DriverLayout title="Tracking">
            <Head title="Tracking" />

            <div className="flex flex-col gap-4">
                <Link href="/driver/assignment" className="self-start text-sm font-medium text-app-primary hover:underline">← Back to My Assignment</Link>
                <div className="rounded-hero bg-gradient-to-br from-terminal-bg to-terminal-surface p-5 text-white">
                    <div className="mb-1 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-terminal-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-terminal-accent" /> Live Tracking Session
                        </p>
                        <StatusBadge status={tracking ? 'ACTIVE' : 'PENDING'} />
                    </div>
                    <h2 className="text-lg font-bold">{assignment.bus?.bus_number} &middot; {directionName ?? assignment.route?.name}</h2>
                </div>

                <div className="rounded-card border border-app-border bg-app-surface p-4">

                    <dl className="mt-3 grid grid-cols-1 gap-3 text-xs text-app-muted sm:grid-cols-2">
                        <div>
                            <dt>GPS Permission</dt>
                            <dd className="mt-0.5 text-app-text">{permission === 'unknown' ? 'Not yet requested' : permission}</dd>
                        </div>
                        <div>
                            <dt>Last GPS Fix (device)</dt>
                            <dd className="mt-0.5 text-app-text">{lastGpsFix ? lastGpsFix.toLocaleTimeString() : 'Waiting for GPS'}</dd>
                        </div>
                        <div>
                            <dt>Last Sent to Server</dt>
                            <dd className="mt-0.5 text-app-text">{lastUpdate ? lastUpdate.toLocaleTimeString() : 'Not sent yet'}</dd>
                        </div>
                        <div>
                            <dt>Next Send Attempt</dt>
                            <dd className="mt-0.5 text-app-text">{tracking ? `in ${secondsToSend}s` : 'Stopped'}</dd>
                        </div>
                        <div>
                            <dt>Accuracy</dt>
                            <dd className="mt-0.5 text-app-text">{accuracy ? `${accuracy.toFixed(1)} m` : '-'}</dd>
                        </div>
                        <div>
                            <dt>Network/Send State</dt>
                            <dd className="mt-0.5 flex items-center gap-1 text-app-text">
                                {sendState === 'error' ? <WifiOff size={13} className="text-app-danger" /> : <Wifi size={13} className="text-app-success" />}
                                {sendState}
                            </dd>
                        </div>
                    </dl>

                    {coords && (
                        <p className="mt-3 flex items-center gap-1 text-xs text-app-muted">
                            <MapPin size={13} /> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                        </p>
                    )}
                </div>

                {gpsError && (
                    <div className="flex items-start gap-2 rounded-control border border-app-danger/30 bg-app-danger/5 px-3 py-2 text-xs text-app-danger">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        {gpsError}
                    </div>
                )}

                <div className="rounded-control border border-app-warn/30 bg-app-warn/5 px-3 py-2 text-xs text-app-muted">
                    Keep this page open and active while driving for reliable tracking. Closing the browser or letting your
                    phone lock the screen may pause GPS updates - this is a known web-browser limitation, not guaranteed
                    background tracking.
                </div>

                {!tracking ? (
                    <PrimaryButton onClick={() => setConfirmStart(true)} className="w-full">Start Trip</PrimaryButton>
                ) : (
                    <DangerButton onClick={() => setConfirmStop(true)} className="w-full">End Trip</DangerButton>
                )}
            </div>

            <ConfirmModal show={confirmStart} onClose={() => setConfirmStart(false)} onConfirm={doStart}
                title="Start Trip" message="Starting a trip will begin sending your live location to the admin and public map." confirmLabel="Start Trip" />

            <ConfirmModal show={confirmStop} onClose={() => setConfirmStop(false)} onConfirm={doStop}
                title="End Trip" message="This will stop tracking and mark your trip as completed." confirmLabel="End Trip" variant="danger" />
        </DriverLayout>
    );
}

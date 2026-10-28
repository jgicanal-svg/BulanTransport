import { useEffect, useRef } from "react";

const DEFAULT_CENTER = [12.82, 123.98];

function createBusIcon(L, status) {
    const color =
        status === "LIVE"
            ? "#22C55E"
            : status === "STALE"
              ? "#F59E0B"
              : "#94A3B8";

    return L.divIcon({
        className: "",
        iconSize: [54, 54],
        iconAnchor: [27, 27],
        popupAnchor: [0, -30],
        html: `
            <div style="
                position:relative;
                width:54px;
                height:54px;
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:16px;
                border:4px solid rgba(255,255,255,.92);
                background:linear-gradient(145deg,#6547ff,#3d2be8);
                box-shadow:0 8px 20px rgba(61,43,232,.35);
            ">
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M8 6v6"/>
                    <path d="M15 6v6"/>
                    <path d="M2 12h19.6"/>
                    <path d="M18 18h3s.5-1.7.8-3.4c.1-.4.2-.8.2-1.1 0-.8-.7-1.5-1.5-1.5H20"/>
                    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-1.7 1.3-3 3-3h11c2.2 0 4 1.8 4 4v10h-5"/>
                    <circle cx="7" cy="18" r="2"/>
                    <path d="M9 18h4"/>
                    <circle cx="15" cy="18" r="2"/>
                </svg>

                <span style="
                    position:absolute;
                    right:-1px;
                    top:-1px;
                    width:14px;
                    height:14px;
                    border-radius:999px;
                    border:3px solid white;
                    background:${color};
                "></span>
            </div>
        `,
    });
}

// Maintain at most one animation per marker. A new GPS position cancels the
// previous transition rather than competing with an earlier animation frame.
function animateMarker(marker, destination, animations, key, duration = 4400) {
    const oldFrame = animations[key];
    if (oldFrame != null) cancelAnimationFrame(oldFrame);
    delete animations[key];

    const start = marker.getLatLng();
    if (Math.abs(start.lat - destination[0]) < 0.0000001 &&
        Math.abs(start.lng - destination[1]) < 0.0000001) {
        marker.setLatLng(destination);
        return;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        document.visibilityState === "hidden") {
        marker.setLatLng(destination);
        return;
    }

    const startedAt = performance.now();
    const step = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        // Linear interpolation keeps the vehicle moving continuously between fixes.
        marker.setLatLng([
            start.lat + (destination[0] - start.lat) * progress,
            start.lng + (destination[1] - start.lng) * progress,
        ]);
        if (progress < 1) {
            animations[key] = requestAnimationFrame(step);
        } else {
            delete animations[key];
        }
    };
    animations[key] = requestAnimationFrame(step);
}

async function fetchRoadGeometry(stops, signal) {
    if (stops.length < 2) {
        return [];
    }

    const coordinates = stops
        .map((stop) => `${stop.longitude},${stop.latitude}`)
        .join(";");

    const url =
        `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
        "?overview=full&geometries=geojson&steps=false";

    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error("Road routing request failed.");
    }

    const data = await response.json();
    const geometry = data.routes?.[0]?.geometry?.coordinates ?? [];

    // GeoJSON provides [longitude, latitude]; Leaflet needs [latitude, longitude].
    return geometry.map(([longitude, latitude]) => [latitude, longitude]);
}

export default function MapPanel({
    height = 620,
    routes = [],
    vehicles = [],
    selectedVehicle = null,
    onMarkerClick,
    fitToRoutes = true,
    autoFollow = false,
    showRoutes = true,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const animationsRef = useRef({});
    const onMarkerClickRef = useRef(onMarkerClick);
    onMarkerClickRef.current = onMarkerClick;
    const routeLayersRef = useRef([]);

    useEffect(() => {
        if (!window.L || mapRef.current || !containerRef.current) {
            return;
        }

        const L = window.L;

        const map = L.map(containerRef.current, {
            zoomControl: true,
            preferCanvas: true,
        }).setView(DEFAULT_CENTER, 11);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        requestAnimationFrame(() => map.invalidateSize());

        return () => {
            map.remove();
            mapRef.current = null;
            Object.values(animationsRef.current).forEach(cancelAnimationFrame);
            animationsRef.current = {};
            markersRef.current = {};
            routeLayersRef.current = [];
        };
    }, []);

    useEffect(() => {
        const L = window.L;
        const map = mapRef.current;

        if (!L || !map) {
            return;
        }

        const controller = new AbortController();

        async function drawRoutes() {
            routeLayersRef.current.forEach((layer) => map.removeLayer(layer));

            routeLayersRef.current = [];

            if (!showRoutes) {
                return;
            }

            for (const route of routes) {
                const stops = [...(route.stops ?? [])].sort(
                    (a, b) => a.stop_order - b.stop_order,
                );

                if (stops.length < 2) {
                    continue;
                }

                let coordinates = [];

                /*
                 * Prefer saved geometry when available.
                 * Expected format:
                 * [[latitude, longitude], [latitude, longitude], ...]
                 */
                if (
                    Array.isArray(route.geometry) &&
                    route.geometry.length >= 2
                ) {
                    coordinates = route.geometry.map((point) => [
                        Number(point[0]),
                        Number(point[1]),
                    ]);
                } else {
                    try {
                        coordinates = await fetchRoadGeometry(
                            stops,
                            controller.signal,
                        );
                    } catch (error) {
                        if (error.name === "AbortError") {
                            return;
                        }

                        // Offline fallback: connect the stops directly.
                        coordinates = stops.map((stop) => [
                            Number(stop.latitude),
                            Number(stop.longitude),
                        ]);
                    }
                }

                if (coordinates.length < 2) {
                    continue;
                }

                const routeShadow = L.polyline(coordinates, {
                    color: "#FFFFFF",
                    weight: 10,
                    opacity: 0.9,
                    lineCap: "round",
                    lineJoin: "round",
                }).addTo(map);

                const routeLine = L.polyline(coordinates, {
                    color: "#315CF4",
                    weight: 6,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                }).addTo(map);

                routeLayersRef.current.push(routeShadow, routeLine);
            }

            if (fitToRoutes && routeLayersRef.current.length > 0) {
                const group = L.featureGroup(routeLayersRef.current);
                const bounds = group.getBounds();

                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [45, 45],
                        maxZoom: 13,
                    });
                }
            }
        }

        drawRoutes();

        return () => controller.abort();
    }, [routes, fitToRoutes, showRoutes]);

    useEffect(() => {
        const L = window.L;
        const map = mapRef.current;

        if (!L || !map) {
            return;
        }

        const visibleKeys = new Set();

        vehicles.forEach((vehicle) => {
            const key = String(vehicle.bus_id ?? vehicle.bus_number);

            const destination = [
                Number(vehicle.latitude),
                Number(vehicle.longitude),
            ];

            if (
                !Number.isFinite(destination[0]) ||
                !Number.isFinite(destination[1])
            ) {
                return;
            }

            if (Math.abs(destination[0]) > 90 || Math.abs(destination[1]) > 180) return;
            visibleKeys.add(key);

            const icon = createBusIcon(L, vehicle.status);
            let marker = markersRef.current[key];

            if (marker) {
                marker.setIcon(icon);
                // Only move when the server reports a genuinely different position.
                const currentTarget = marker._bulanTarget;
                if (!currentTarget || currentTarget[0] !== destination[0] ||
                    currentTarget[1] !== destination[1]) {
                    marker._bulanTarget = destination;
                    animateMarker(marker, destination, animationsRef.current, key);
                }
            } else {
                marker = L.marker(destination, {
                    icon,
                    zIndexOffset: 1000,
                    title: vehicle.bus_number ?? "Tracked bus",
                }).addTo(map);

                marker._bulanTarget = destination;
                marker._bulanVehicle = vehicle;
                marker.on("click", () => {
                    onMarkerClickRef.current?.(marker._bulanVehicle);
                });

                markersRef.current[key] = marker;
            }

            marker._bulanVehicle = vehicle;
            marker.unbindPopup();
            marker.bindPopup(`
                <div style="min-width:180px">
                    <strong>${vehicle.bus_number ?? "Bus"}</strong><br>
                    Driver: ${vehicle.driver_name ?? "Unassigned"}<br>
                    Route: ${vehicle.route ?? "No route"}<br>
                    Status: ${vehicle.status ?? "Unknown"}<br>
                    Last update: ${vehicle.last_update ?? "N/A"}
                </div>
            `);
        });

        Object.keys(markersRef.current).forEach((key) => {
            if (!visibleKeys.has(key)) {
                if (animationsRef.current[key] != null) {
                    cancelAnimationFrame(animationsRef.current[key]);
                    delete animationsRef.current[key];
                }
                map.removeLayer(markersRef.current[key]);
                delete markersRef.current[key];
            }
        });
    }, [vehicles]);

    useEffect(() => {
        if (!autoFollow || !selectedVehicle || !mapRef.current) {
            return;
        }

        const latitude = Number(selectedVehicle.latitude);
        const longitude = Number(selectedVehicle.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            mapRef.current.flyTo([latitude, longitude], 15, {
                duration: 0.8,
            });
        }
    }, [
        autoFollow,
        selectedVehicle?.bus_id,
        selectedVehicle?.latitude,
        selectedVehicle?.longitude,
    ]);

    return (
        <div
            ref={containerRef}
            style={{ height }}
            className="h-full w-full overflow-hidden rounded-card border border-app-border"
        />
    );
}

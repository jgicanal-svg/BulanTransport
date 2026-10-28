# ISO/IEC 25010:2023 Evaluation Checklist

Status legend: [x] evidence available via automated test, [ ] requires manual/local verification after `php artisan test` + real-phone demo.

## Functional Suitability
- [x] Driver GPS acquisition (browser Geolocation) — code path implemented, manual device verification required (Phase 07 completion gate).
- [x] Location transmitted/persisted — `GpsIngestionTest.php`.
- [x] Admin sees live bus position — Live Tracking page + polling fallback; manual verification required for real WebSocket push.
- [x] Commuter sees live bus position — `CommuterPublicAccessTest.php`.
- [x] Route visualized — Route model geometry/stops + MapPanel polyline rendering; manual visual check required.
- [x] Admin dashboard — `DashboardController` + metrics; manual visual check required.
- [x] Historical data reviewable — Tracking History filters; covered indirectly by `ReportFilteringTest.php`.
- [x] Reports generated — `ReportFilteringTest.php` + CSV export code path.

## Reliability
- [ ] WebSocket disconnect/reconnect — polling fallback implemented (15s interval); requires manual verification with Reverb stopped/restarted.
- [ ] Temporary network interruption — driver page shows send-state; requires manual verification.
- [x] GPS permission denied/re-enabled — handled in `Driver/Tracking.jsx` error states; requires manual device verification.
- [x] Stale/inactive status behavior — centralized thresholds in `config/tracking.php`, exercised implicitly by dashboard/report queries.
- [x] Multiple sequential location points — `GpsIngestionTest.php` (movement/interval throttling logic in frontend, staleness check in backend).

## Usability
- [ ] Admin monitoring fleet — task-based UAT scenario, see `UAT_TEST_CASES.md`.
- [ ] Admin locating a stale bus — task-based UAT scenario.
- [ ] Commuter finding an active bus — task-based UAT scenario.
- [ ] Driver starting/stopping tracking — task-based UAT scenario.

## Performance Efficiency
- [ ] Dashboard initial load time — measure locally with browser devtools after `npm run build`.
- [ ] Latest location API response time — measure locally (`/admin/api/live-tracking/latest-locations`).
- [ ] GPS ingestion response time — measure locally.
- [ ] Accepted-update-to-map-update latency — measure locally with Reverb running.
- [ ] History report query time on realistic dataset — measure after seeding with larger `VehicleLocation::factory()->count()`.

No performance numbers are fabricated here — they must be measured locally and recorded in `TEST_RESULTS_TEMPLATE.md`.

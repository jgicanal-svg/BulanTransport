# UAT Test Cases

## Admin: Monitor the fleet
1. Log in as `admin@bulantransport.test`.
2. Open Dashboard — confirm KPI cards render with seeded data.
3. Open Live Tracking — confirm the seeded "live" demo bus appears on the map.
4. Click a stat card — confirm it opens relevant detail/filtered view.

## Admin: Locate a stale/inactive bus
1. From Dashboard, note the "Stale/Inactive" count.
2. Open Reports → Stale/Inactive Vehicle report.
3. Confirm listed buses have no recent `latest_vehicle_locations` row within the inactive threshold.

## Commuter: Find an active bus
1. Visit `/` or `/live-buses` without logging in.
2. Confirm the seeded live demo bus appears with LIVE status.
3. Use the search/filter to narrow by route.

## Driver: Start/stop tracking
1. Log in as `driver@bulantransport.test`.
2. Open My Assignment — confirm assigned bus/route shows.
3. Open Tracking — tap Start Trip, confirm confirmation modal, then confirm GPS permission prompt appears (on a real device/HTTPS).
4. Confirm "Last Update" and accuracy populate after a few seconds.
5. Tap End Trip, confirm confirmation modal, then confirm trip status becomes COMPLETED.

# Known Limitations

1. **Browser-based background tracking**: GPS transmission is only reliable
   while the driver's tracking page stays open/active. This is a documented,
   intentional MVP limitation (see project `GPS_ASSUMPTIONS_AND_LIMITATIONS.md`),
   not a bug. Wake Lock is used only as a progressive enhancement.
2. **Unexecuted/unverified generation**: this codebase was generated in an
   environment without PHP/Composer/MySQL/network access, so no migration,
   test, or build command was actually executed before packaging. A static
   review was performed (imports, route names, relationships, validation
   rules) but local execution may surface issues — see `SETUP_INSTRUCTIONS.md`.
3. **Real-time broadcasting requires Reverb running**: without
   `php artisan reverb:start`, live map updates fall back to 15-second
   polling rather than instant WebSocket push. This fallback is intentional
   per the phase requirements, not a missing feature.
4. **Demo route/stop coordinates** are approximate and for demonstration
   purposes only — not an officially validated Bulan Transport Cooperative
   GPS survey.
5. **PDF export** was not implemented (CSV only), consistent with the
   project instructions marking PDF as optional.
6. **Visual polish**: functional UI following the approved design tokens was
   prioritized over pixel-level refinement, per the stated priority order
   (backend correctness first).

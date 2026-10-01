# Clash Verge observation record

- Surface: macOS desktop app, Clash Verge
- Version: 2.4.7 (read from the installed app bundle metadata)
- Observed: 2026-09-06, Asia/Shanghai, approximately 14:01–14:04
- Method: native desktop accessibility tree plus screenshots; no automated network test
- Scope: Proxy, Connections, Rules, Logs, Test
- Action policy: read-only navigation only; no proxy mode or node switch, subscription update, configuration edit, log clear, connection close, or test execution

## Observed facts

- Proxy page exposes Rules, Global, Direct, and Chain Proxy mode buttons; the PROXY group showed DMIT-PH-Smart selected and cards for DMIT-PH-Smart, DMIT, and DIRECT.
- Connections page exposes Active and Closed filters, a text filter, column settings, and columns for host, traffic, speed, chain, rule, process, time, source, destination, and type.
- Rules page exposed a text filter and a visible rule result with PROXY handling.
- Logs page exposed pause, time order, clear, a level selector, and a text filter. The selector contained ALL, DEBUG, INFO, WARN, and ERROR.
- Test page exposed a “Test all” entry and per-service test entries whose observed state was pending. No test was started.

## Evidence handling

`assets/clash-proxy.jpg`, `assets/clash-rules.jpg`, `assets/clash-logs.jpg`, and `assets/clash-tests.jpg` are screenshots captured from the live app. `assets/clash-connections.jpg` was redacted before saving: the connection table body is covered while the page structure and controls remain visible. No credentials, subscription URLs, private IPs, or connection destinations are retained in the tutorial assets.

## Limits

The observed state can change with configuration, traffic, time, and network conditions. The record explains visible UI relationships; it does not prove that every displayed proxy route succeeds or that unvisited settings behave in a particular way.

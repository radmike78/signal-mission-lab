# Understand why the network fails

The equipment explorer now offers one issue at a time, with the intended behavior, failure mechanism, a discriminating first check, an authorized correction boundary and proof of recovery. Correction and references are collapsed to keep the first view short. No operational data is collected.

## Current milestone

Eight editorial learning checks cover OSPF discovery and database exchange, DMVPN underlay and NHRP, encryption versus encapsulation, packet-size problems, TACLANE fault boundaries and COMSEC readiness. Six commercial networking topics are conditionally linked to 16 node/network catalog entries. Two public awareness topics are linked to the cryptographic-device overview. A link is a study suggestion, not a verified equipment configuration.

All 87 catalog entries have explicit coverage accounting in `data/network-failures.json`. **70 entries still have no published failure guide.** SATCOM lock/receive/transmit acceptance, radio waveform/RF faults, server/application dependencies and other equipment-specific guides remain to be researched. The existing synthetic recovery exercises are separate and do not close these equipment-manual gaps.

These are prioritized study checks, not measured Army failure rankings. Sources do not establish which OSPF network type, DMVPN phase, software, security policy or encryptor model any unit uses. Do not assume every tunnel uses DMVPN or every Army system uses the same COMSEC equipment.

## Research evidence and limits (31 October 2026)

Cisco OSPF neighbor, Exstart/Exchange, DMVPN and GRE keepalive pages were retrieved from primary public documentation. The Exstart article uses an older IOS lab; it supports the mechanism, not a current Army configuration. GRE status behavior depends on release and design. Keepalive advice must not be transferred blindly to protected tunnels.

General Dynamics TACLANE training and the Army PM Tactical Radios COMSEC page were discoverable through indexed excerpts; direct retrieval returned HTTP 403. Metadata records this limitation. No TACLANE operator manual, alarm table, keying sequence or model-specific setup has been verified. The public training listing is not technical substantiation for device troubleshooting. The TACLANE entry is explicitly an editorial fault-isolation exercise pending approved technical review.

Actual model/release troubleshooting requires approved operator/maintenance references and a qualified reviewer. Restricted manuals and operational COMSEC material must stay in their authorized environment; do not upload them to this public repository or app. Missing public-release references should be identified by title/model/release, without attaching restricted content.

## Validation

The content validator rejects missing catalog coverage, unknown issue/source references, missing reasoning, duplicate entries and non-allowlisted source hosts. This validates structure and traceability, not factual approval. Unit tests include malformed provenance and missing rationale. The browser journey exercises offline use, narrow-screen layout, issue selection, explicit missing coverage and protection boundaries. All content retains `human_review_pending`.

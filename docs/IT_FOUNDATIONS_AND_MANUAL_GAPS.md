# IT foundations and equipment documentation gaps

19 October 2026. This milestone adds introductory computing, virtualization, Layer 2 switching, Layer 3 routing, identity/DNS, storage, firewall policy, containers, recovery and security education. There are nine lessons, eight vendor/tool groups, twelve scoped primary references and a synthetic dependency lab. The lessons are editorial training content with human review pending, not vendor certification courses or implementation procedures.

## What manuals are actually available?

The repository has six doctrine publication records with mixed retrieval states, equipment-purpose claims from public articles, and an equipment coverage register. It does **not** contain an equipment-specific operator/maintainer TM corpus sufficient for end-to-end implementation. The new references are public vendor documentation, Army articles and NIST publication pages; they are not a substitute for applicable equipment TMs, software baselines or verified interface documentation. Eight prior equipment-source discoveries remain pending; FM 5-0 retrieval also remains pending. No restricted manuals were requested, obtained or ingested.

## Information needed for deeper technical accuracy

Only provide information approved for public sharing with this project:

| Needed reference | Why it matters |
|---|---|
| Public official designation and exact variant | Similar family names can cover different components and capabilities. |
| Applicable publication number, edition and change package | Establishes which operator/maintainer guidance applies. A title alone does not establish releasability. |
| Public software, firmware and hardware baseline references | Prevents applying instructions for one release to a different platform. |
| Public interface-control and integration references | Establishes a specific connection or data exchange, rather than inferring it from IP connectivity. |
| Public vendor compatibility and supported-platform matrices | Helps validate hypervisor, server, NIC, storage and OS combinations. |
| Releasable system/component architecture and service descriptions | Helps explain support boundaries and dependencies without real network plans. |
| Qualified human review | Confirms scope, source interpretation and learning accuracy. |

Do not supply controlled manuals, unit property books, live configurations, keys, fills, credentials or operational network plans. A private model/server does not approve their handling.

## Evidence boundaries

[CECOM's November 2025 modernization report](https://www.army.mil/article/288657/modernizing_tactical_infrastructure) provides scoped examples involving virtualization and container modernization. [An installation switching article](https://www.army.mil/article/259061/nec_announces_switch_upgrade_project_to_enhance_security_reliability) illustrates vendor diversity. Neither establishes a universal current baseline.

The vendor directory includes Microsoft, VMware/Broadcom, Cisco, Palo Alto Networks, NetApp, Red Hat/open-source technologies, additional modernization tools and Juniper switching awareness. Each entry identifies its reference scope. Product manuals teach product behavior; they do not by themselves prove that a particular Army node uses that product. Army system-to-model mappings for Palo Alto and NetApp remain unverified in this research. Additional server, storage-array, endpoint-security, backup, automation and cloud products can be added when public references and applicability are established. No vendor is endorsed or recommended for purchase.

## Learning behavior

Each lesson provides an observable outcome, plain-language explanation, glossary, fictional diagnostic question, per-answer feedback and expandable provenance. Learners can open related equipment study records; these links are conceptual study links, not compatibility edges. Practice is local and clears on unmount; it is not saved as an instructor grade.

The dependency lab models one dummy user task requiring power, compute, readable storage, network reachability, accepted identity and permitting policy. It displays all unmet dependencies and links to relevant lessons. This is not a hypervisor, router, firewall or storage emulator. It neither applies configurations nor diagnoses actual equipment.

## Source governance and validation

`technology-learning.json` is separate from Army equipment claims. Its validator enforces source-origin classification (Army context, vendor education, standards education), HTTPS URL rules, unique IDs, valid lesson answers and resolvable sources/study links. The existing Army-claim allowlist is unchanged. A metadata-only NIST reference is labeled accordingly; human review remains pending for all new curriculum. No runtime retrieval, additional credentials, uploads, paid AI or operational inputs are introduced.

Local TypeScript build, source/curriculum gate, 31 catalog/security/curriculum tests and 24 web model tests passed. Browser checks exercise lesson feedback/reset, vendor provenance, failed/restored dependencies, equipment study links and mobile overflow. Full CI also covers backend/PostgreSQL, security/dependencies and rootless Podman. Consult PR checks for final validation. Full course authoring, advanced vendor labs, instructor scoring, accessibility/SME review and equipment-specific implementation remain open.

Next-depth topics include TCP/UDP and subnetting, STP and routing protocols, NAT/VPN concepts, certificate/time dependencies, storage multipathing and snapshots, backup/restore tools, hardening/patching and monitoring. Server/NIC/storage hardware, endpoint protection, automation and cloud vendor coverage require additional public sources and system-specific applicability review.

Screenshots: [lesson](screenshots/it-foundations.png), [vendor directory](screenshots/it-vendors.png), [mobile lesson](screenshots/it-foundations-mobile.png).

## Vendor troubleshooting expansion · November 2026

The curriculum now includes 20 lessons and 14 vendor or technology groups. From **IT foundations → Vendors**, open a product, launch its fictional case and review the linked objectives or training. Study links are supplemental and do not claim exam coverage, eligibility, credential award, or Army qualification. The scored cases, explanations and source metadata are bundled for offline use. External vendor pages require connectivity and may require an account. Source metadata distinguishes a checked page from a public listing or search excerpt. A curriculum reviewer should confirm details and applicable releases before external use.

| Vendor | Diagnostic skill | Study path |
|---|---|---|
| Cisco | Compare the affected client, access port, supplied address and gateway against a known-good baseline | CCNA |
| VMware / Broadcom | Trace guest, port group and host uplink after a VM move | VCP vSphere Foundation Administrator |
| Riverbed | Correlate an application measurement with SteelHead pass-through status and reason | SteelHead Core |
| Red Hat | Trace a failed Linux service startup through its status, journal and prerequisite | RHCSA Linux administration |
| Microsoft | Compare client DNS results and verify the intended service | Windows Server Administrator AZ-802 |
| Palo Alto Networks | Interpret the rule action and session end reason together | Network Security Professional |
| Palantir | Locate an upstream failed build or stale dataset in Foundry | Foundry Aware and Data Engineer |
| Dell | Correlate PowerEdge hardware health and Lifecycle Log timestamps with host and guest symptoms | PowerEdge Foundations published outline; verify availability |
| NetApp | Separate ONTAP NFS reachability from an export or file permission problem | Data Administrator ONTAP |
| Curtiss-Wright / PacStar | Distinguish the IQ-Core management view from the observed user service | Public product reference |
| General Dynamics Mission Systems | Describe a mismatch between fictional status and service and hand it off for authorized review | Official TACLANE operator training referral |
| Juniper and CompTIA | Review routing and client connectivity fundamentals | JNCIA-Junos and Network+ |

The Army Vantage quick reference provides a dated Foundry example. It does not establish how Maven is configured. The vendor catalog does not infer deployed versions, configurations, authorization, or a complete Army inventory.

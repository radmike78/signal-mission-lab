# Source acquisition and unresolved technical references

Research checkpoint: 19 October 2026. This is a research register, not an approved equipment procedure or a complete inventory of Army systems. Existing catalog, publication and curriculum records remain the source of truth for implemented content. Sources below have not automatically been promoted into the knowledge graph or mentor corpus. No equipment-specific TM body was obtained in this pass.

## What was retrieved and what remains missing

| Track | Evidence obtained | Missing before equipment-specific instruction |
|---|---|---|
| Mission analysis / MDMP | Existing repository records for FM 6-0, ADP 5-0 and FM 6-02; their retrieval states remain in `data/publications.json`. | FM 5-0 full-text retrieval remains pending; applicable edition/change and paragraph-level review before new claims. |
| JNN / CPN routing | Public Cisco DMVPN workflow and OSPF neighbor troubleshooting contents; public Army catalog metadata for several node families. | Exact node variant, software baseline, supported DMVPN phase/design, approved configuration and Army troubleshooting reference. |
| PowerShell builder failures | Microsoft Windows PowerShell 5.1 scripts, error handling, common parameters and debugger documentation. | Actual releasable builder documentation, runtime version, dependencies, manual operations, checkpoints, rollback and rerun behavior. No Army builder script obtained. |
| STT / RHN | Public STT-family TM catalog entries and historical Army architecture context. | Applicable terminal/modem/controller versions, public acquisition/fault references, receive/transmit status meanings, authorization boundaries and approved RHN handoff checklist. No satellite lock or transmit procedure obtained. |
| T2C2 | Army fielding overview and public acquisition article describing training/manual support routes. | Applicable Lite/Heavy operator/maintainer manual, software baseline, fault isolation and service acceptance criteria. |
| TRILOS | Army fielding/training overview. | Operator/maintainer manual, hardware/software applicability, public alignment/link diagnostics and supported interfaces. Current program page returned HTTP 403. |
| GAIT | Army global-network overview article. | Current public service description, prerequisites, responsibilities and provisioning/fault escalation reference. Program-page retrieval failed; access classification is unknown. |
| JBC-P / MMC | Existing public Army purpose records and discovery of DOT&E FY2023 MMC-S report. | Operator/maintenance and quick-reference content for each variant/release. DOT&E PDF retrieval failed (canonical URL returned HTTP 403); search excerpts were not treated as reviewed report content. |
| HF / FM radios | Public L3Harris fundamentals page covering RF, propagation, antennas and HF learning topics; existing Army family-purpose sources. | Model-specific public manuals, waveform/software applicability, accessories, safety references and approved troubleshooting. The fundamentals landing page is not a complete radio course or model manual. |
| PacStar / IQ-Core | Public Curtiss-Wright software overview and NCM product page. | Versioned operator/admin manual, supported-device/plugin matrix, task behavior, audit/error semantics, recovery and Army-node applicability. Product claims are vendor statements, not interoperability verification. |
| Compute / storage / security | Existing vendor curriculum references for Microsoft, VMware/Broadcom, Cisco, Palo Alto, NetApp, Red Hat and standards. | Public Army system/component mappings, supported hardware/software matrices and versioned configuration/recovery references. Vendor inclusion does not establish installation in every Army system. |

## Retrieved public primary references

These links were opened successfully during this research pass. Locator names identify useful sections; retrieval is not endorsement or complete technical validation.

| Publisher / reference | Useful locator and bounded use |
|---|---|
| [Cisco: Troubleshoot DMVPN Issues](https://www.cisco.com/c/en/us/support/docs/security/dynamic-multipoint-vpn-dmvpn/111976-dmvpn-troubleshoot-00.html) | Troubleshooting workflow; underlay, tunnel/security, NHRP, routing and traffic. Phase-specific guidance must stay separate. Some diagnostics change security controls and must not become default learner fixes. |
| [Cisco: Troubleshoot OSPF Neighbor Problems](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13699-29.html) | Neighbor states and typical causes. A 2-way state is not universally a failure. |
| [Cisco: Exstart/Exchange](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/13684-12.html) | MTU example; historical lab versions require applicability checks. |
| [Cisco: DMVPN configuration guide](https://www.cisco.com/c/en/us/td/docs/routers/ios-xe/security-vpn/security-vpn/m_sec-conn-dmvpn-dmvpn-0.html) | Prerequisites/restrictions and verification concepts; not an Army design baseline. |
| [Microsoft: about_Scripts, PowerShell 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_scripts?view=powershell-5.1) | Parameters, scope and script behavior; builder runtime remains unknown. |
| [Microsoft: about_Try_Catch_Finally, 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_try_catch_finally?view=powershell-5.1) | Error handling for synthetic script explanations. |
| [Microsoft: about_CommonParameters, 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_commonparameters?view=powershell-5.1) | ErrorAction and diagnostic output. WhatIf is supported only where implemented; it is not a blanket safe dry run. |
| [Microsoft: about_Debuggers, 5.1](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_debuggers?view=powershell-5.1) | Script inspection and controlled synthetic debugging. |
| [Army: Global network super highway](https://www.army.mil/article/248248/global_network_super_highway_postures_army_for_multi_domain_operations) | Historical GAIT/global transport context, not current provisioning instructions. |
| [Army: inflatable satellite communications](https://www.army.mil/article/201567/army_equips_first_unit_with_inflatable_satellite_communications) | T2C2 family and fielding context. |
| [Army AL&T: Simplifying SATCOM](https://asc.army.mil/web/news-alt-jas17-simplifying-satcom/) | “Teaching the unit to fish” describes manual/training support routes; does not supply those manuals. |
| [Army: first Armored BCT high-capacity systems](https://www.army.mil/article/224877/army_fields_first_armored_bct_with_high_capacity_network_systems) | TRILOS fielding/training context. |
| [Curtiss-Wright: IQ-Core overview](https://defense-solutions.curtisswright.com/media-center/blog/overview-pacstar-iq-core-software) | Software-suite purpose and automation context. |
| [Curtiss-Wright: IQ-Core NCM](https://defense-solutions.curtisswright.com/products/networking-communications/tactical-networking/iq-core-software/ncm) | Product overview: monitoring, configuration and troubleshooting. No versioned operator manual obtained. |
| [L3Harris: communication fundamentals](https://www.l3harris.com/fundamentals-mission-critical-communication) | Public learning-topic index for RF, antennas and propagation. Linked videos/materials were not individually reviewed. |

## Army Pubs manual leads: metadata only

The [APD technical manual index](https://armypubs.army.mil/ProductMaps/PubForm/TM.aspx) directs readers elsewhere for electronic TMs. Its [11-5 catalog](https://armypubs.army.mil/ProductMaps/PubForm/TM_11_5.aspx), retrieved earlier in this pass, directs electronic AMC publications to LDAC/AESIP with registration required. A later retrieval attempt failed. No authenticated access was attempted. Catalog ACTIVE status does not establish public releasability or suitability for a particular fielded configuration.

| Catalog number | Catalog date | Family lead; applicability unverified |
|---|---|---|
| TM 11-5895-1868-13&P | 2018-01-01 | STT AN/TSC-185 variants |
| TM 11-5895-1869-13&P-1 | 2020-12-31 | STT AN/TSC-167 F/G/H variants, volume 1 |
| TM 11-5805-861-13&P-1 / -2 | 2007-10-15 / 2010-09-30 | Earlier AN/TTC-59 variants |
| TM 11-5805-864-13&P-1 / -2 / -3 | 2017-02-28 / 2017-03-31 / 2017-03-31 | Later WIN-T Increment 1 node variants |
| TM 11-5895-1875-13&P | 2014-03-31 | AN/TTC-64 family lead relevant to CPN research |

These identifiers help an authorized reviewer locate the applicable reference through approved channels. They are not requests to copy controlled content into this project. Complete radio-series and newer-system catalog searches remain unfinished; absence from this table is not evidence that a manual does not exist.

## What can proceed now

Author synthetic, human-reviewed exercises that connect mission-service failures to observable dependencies: transport availability, tunnel establishment, OSPF adjacency, learned routes and application reachability. Teach why each check matters and what evidence distinguishes failure domains. Use invented outputs and no operational addresses or settings.

For PowerShell, explain each synthetic operation and its manual equivalent, expected state, partial completion and recovery decision. Do not assume rerunning is safe, execution-policy bypass is appropriate, or automation success proves mission readiness.

For satellite training, distinguish acquisition indications from usable receive/transmit service and dependent mission-service acceptance. Exact status thresholds and equipment actions stay pending until an applicable public source and qualified reviewer establish them. This is a curriculum plan, not a validated STT procedure.

## Information still needed from an approved public source

Public model/designation, publication identifier/edition/change, software baseline, vendor manual/compatibility reference, and publicly releasable task/error examples would narrow these gaps. Qualified Signal and vendor review remains needed. No credentials are needed to continue generic synthetic curriculum. No purchase, contact form, login, restricted-document download or external message was made.

Do not provide classified information, CUI, COMSEC, keys/fills, credentials, live configurations or real operational network plans. A private repository or privately hosted model does not establish authorization to process them. If a needed reference is not publicly releasable, record the gap and keep exact procedures outside this platform's current scope.

## Validation and limitations

Documentation-only checkpoint: no runtime functionality, catalog coverage, interoperability status or production-readiness claim changed. URLs and retrieval outcomes were recorded from this session; there is no continuous availability monitor. Existing source validation should still pass, but this report itself is a research log outside the machine-validated claim registry. Later curriculum promotion requires scoped citations, applicability and human review.

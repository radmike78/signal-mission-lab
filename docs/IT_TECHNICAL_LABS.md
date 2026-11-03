# IT professional diagnostic labs

Open **Technical labs** in More learning tools, or use **Open technical labs** in Courses. Eight labs teach concrete network and server troubleshooting through fictional baselines, observed configurations, reference commands, supplied output, first-choice decisions and recovery evidence.

| Lab | Evidence to interpret | Practical skill |
| --- | --- | --- |
| IPv4 subnet | /16 versus /24, connected route, failed destination ARP | Calculate local versus routed delivery and select the next hop |
| VLAN | Access-port membership, MAC placement, trunk forwarding | Trace a client into the correct broadcast domain |
| DNS | Explicit resolver responses and separate TCP result | Distinguish name resolution, transport, TLS and application acceptance |
| OSPF | EXSTART, both interface profiles, missing destination route | Correlate MTU mismatch with incomplete adjacency and forwarding |
| DMVPN | Approved NBMA endpoint, NHRP map, non-UP peer | Distinguish underlay connectivity from a usable protected overlay |
| Windows identity/time | Explicit skew error, time source, working TCP | Trace an authentication dependency without weakening policy |
| Linux service/storage | Byte capacity, inode capacity, service write error | Diagnose the data path and plan data-preserving recovery |
| VM listener | Loopback-only socket, local health, failed remote TCP | Separate process availability from remote service exposure |

## Teaching sequence

Read the four-node dependency diagram, mechanism and baseline. Inspect all three supplied evidence records; these buttons reveal records and never run commands. The diagnosis stays locked until the evidence is inspected, but opening evidence earns no score. Make a diagnosis, choose a correction plan, then compare the separately supplied recovery record and choose acceptance checks. Each first choice remains recorded; feedback shows the supported reasoning. Wrong choices do not trigger simulated repairs. Reference recovery always explicitly assumes the documented correction, regardless of what the learner selected.

Each completed lab includes a scoped leader-impact statement and a separate hands-on task for an isolated lab or instructor-supplied dataset. Reading outputs and answering three questions is not practical qualification. An instructor must observe command execution, interpretation, approved change/rollback and the original receiving-user task separately.

## Implementation and privacy

Content is static JSON. The React workbench is lazy-loaded and available through the existing offline public-asset cache. Active attempts stay in React memory across learning areas and lab selection; reset affects only the chosen lab, reload clears all active attempts. Optional local history stores only the existing kind/score/total/time summary, never commands, outputs, settings, answers or free text. No terminal, upload, device connection, external AI call, backend grading endpoint or migration is added. Results are not sent to connected instructor accounts.

Public Microsoft, Cisco, systemd, GNU coreutils and iproute2 documentation supports command context and mechanisms. Topologies, values, incidents and teaching outputs are editorial, abridged examples. Source retrieval dates/scopes are visible per lab. Source-content retrieval is not qualified technical approval. The publication gate requires eight distinct labs, three evidence records and three decisions each, complete feedback/recovery/practical tasks, permitted HTTPS sources and explicit pending human review. It does not certify facts.

The generic vendor examples do not establish an installed Army variant or version. Equipment-specific STT menus and acquisition/transport acceptance, JNN/CPN configurations, BCCS/TSI service inventories, radio procedures and COMSEC operations still require the applicable publications and qualified technical review. No cryptographic settings, keys or operational inputs are included.

## Validation

Node tests exercise evidence gating, ordered first-choice scoring, incorrect attempts and rejection of invalid/sparse state. Python tests enforce the source/content structure and independently calculate the subnet example. Browser tests run all eight cases offline, retain a wrong first choice, check cross-area continuity, recovery labeling, summary-only persistence, reset/reload, all lab layouts and automated accessibility at desktop and mobile sizes. The full existing PR suite remains required for security, database/restore, containers and native builds. Automated checks do not replace human technical or assistive-technology review.

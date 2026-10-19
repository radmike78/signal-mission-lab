# BCCS and TSI stack coverage

19 October 2026. TSI already existed in the catalog. Added a distinct BCCS stack entry, mission-intake recognition for BCCS/TSI and full names, stack/version search aliases, scoped Army sources, and BCCS study links from existing TSI-related foundation lessons. The catalog now contains 87 entries, including families/software/categories, not 87 verified hardware models. No new navigation destination or required course was added.

The [2013 Army readiness article](https://www.army.mil/article/109664/mirroring_home_station_and_deployed_mission_command_systems_improves_soldier_readiness) describes BCCS server-stack context. Existing TSI coverage uses a 2022 Army article discussing TSIv3. The [2025 modernization article](https://www.army.mil/article/288657/modernizing_tactical_infrastructure) discusses variant-specific virtualization and modular/container initiatives. These are public overviews, not operator manuals. Human equipment review remains pending.

Keep BCCS, TSI hardware versions, software baselines and modernization releases separate. Public sources use both Tactical Server Infrastructure and Tactical Services Infrastructure; this does not establish that every similarly numbered variant refers to the same hardware/software lineage. Do not infer that all BCCS/TSI stacks use VMware, Hyper-V or containers, or that an article's proposed modernization is currently installed in a given unit.

Study prompts focus on one affected mission service: power/host/storage, the affected VM/workload, required identity/name/time services, application health, then the dummy user task. These are editorial investigation prompts, not verified stack dependencies or boot/configuration instructions. Existing guided builder practice can explain partial completion generically; it is not a BCCS/TSI builder emulator or a new equipment-specific exercise.

Still missing: applicable public operator/maintainer manuals, exact stack/component and software baselines, supported combinations, documented start/stop/recovery order, backup/restore procedures, and qualified technical review. No restricted manual or actual operational configuration was obtained. No interface edge or interoperability status was promoted.

Validation: production TypeScript build, source/curriculum gate, catalog/security and mission-intake regression checks. Full PR CI must also pass. The simple three-destination navigation and one-check troubleshooting flow are unchanged.

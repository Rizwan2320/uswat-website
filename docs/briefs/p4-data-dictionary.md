# Brief: data dictionary (P4 deliverable), agent 4, 2026-11-14

- **Objective.** The plan lists a data dictionary among the P4 deliverables. `docs/data-dictionary.md` lists every collection and field (type, required, translated, notes), the governance group, and the rules that hold for all records (source needed, reviewer-only verification, Sample labelling, personal-field visibility).
- **Paths touched.** `apps/web/scripts/data-dictionary.ts` (new), `apps/web/package.json` (one script, `dictionary:build`), `docs/data-dictionary.md` (generated), `docs/STATUS.md`. Nothing under `src/`.
- **Why generated.** A hand-written table would drift from the schema the first time a field changes. The script reads the loaded CMS config. Three in, two out: it lets us not keep hand-written field tables and not review them for drift; no dependency added.
- **Risks.** None for data (reads configuration only, writes one Markdown file). The file is a snapshot of `main` at 66efb07; rerun the script after a schema change.
- **Not run:** a test that fails when the file is stale (loading the config needs the environment variables, so it is not a plain unit test); a CI step. Both are candidates for the main agent.

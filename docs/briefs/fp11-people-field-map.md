# Field map: portal profile (FP-11) against the People collection on `main`

Date 2026-11-18. From the FP agent, to the P3 agent and the main agent. Nothing here changes P3's collection; it is the list I would need if the portal gate passes. It answers the open question in `docs/briefs/p3-fp-interface.md` ("does the allow-list match FP-02 and FP-03 exactly? list the fields").

| Portal field | Faculty may edit? | Risk class (FP-03) | People field today | Needed from P3 |
|---|---|---|---|---|
| Name (en, ur) | No | High-impact | `name` (localized) | none |
| Designation | No | High-impact | `designation` (localized) | none |
| Department | No | High-impact | `department` (relationship) | none |
| Status (current, former, emeritus) | No | High-impact | `facultyStatus` | none |
| Bio (en, ur) | Yes | Low | `details` (localized textarea) | none |
| CV link | Yes | Low | `cvLink` | none |
| Email visibility | Yes (visibility only) | Low | `visibility.email` | none |
| Photo visibility | Yes (visibility only) | Low | `visibility.photo` | none |
| Research interests (keywords and tags) | Yes | Low | none | new field (array of text) |
| Office location | Yes | Low | none (`office` is a relationship to an Office, not a room) | new field (text) |
| Office hours | Yes | Low | none | new field (text) |
| ORCID iD | Yes | Low | none | new field (text, checksum-validated) |
| Google Scholar link | Yes | Low | none | new field (text, https only) |
| Phone visibility | Yes (visibility only) | Low | none (no phone field) | new field plus `visibility.phone` |
| Photo itself | Yes | Low | `photo` (upload) | consent flag |
| Who claimed the record | System only | n/a | none | `claimedBy` (opaque text id) |
| Where an edit came from | System only | n/a | none | `faculty` origin value, `onBehalfOf` in the audit log |

The sample adapter implements the same shape in memory and in `identity.profile_draft`, so connecting the real collection means writing one adapter (read People, write with origin `faculty` through a content service), not changing screens.

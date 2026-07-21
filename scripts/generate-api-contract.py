#!/usr/bin/env python3
"""Regenerate docs/api-contract.md from Nest controllers. Run from repo root."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
controllers = sorted((ROOT / "apps/api/src").rglob("*.controller.ts"))
rows = []
for c in controllers:
    text = c.read_text()
    parts = re.split(r"@Controller\(", text)
    for part in parts[1:]:
        m = re.match(r"['\"]([^'\"]*)['\"]?\)", part)
        base = m.group(1) if m else ""
        for hm in re.finditer(r"@(Get|Post|Put|Patch|Delete)\(([^\)]*)\)", part):
            method = hm.group(1).upper()
            route = hm.group(2).strip().strip("'\"")
            path = f"/{base}/{route}".replace("//", "/").rstrip("/")
            if not route:
                path = f"/{base}" if base else "/health"
            rows.append((c.relative_to(ROOT), method, path))

out = [
    "# API Contract\n\n",
    "**Base URL:** `http://localhost:3001/api/v1`  \n",
    "**Swagger (dev):** `/api/v1/docs`  \n",
    "**Auth:** Bearer JWT unless `@Public()`.\n\n",
    "## Endpoint index\n\n",
    f"{len(rows)} routes indexed from controllers.\n\n",
    "| Method | Route | Module file |\n",
    "|--------|-------|-------------|\n",
]
for cf, method, path in rows:
    out.append(f"| {method} | `{path}` | `{cf}` |\n")

(ROOT / "docs/api-contract.md").write_text("".join(out))
print(f"Wrote {len(rows)} endpoints to docs/api-contract.md")

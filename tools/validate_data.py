#!/usr/bin/env python3
"""Validate early content data using only Python's standard library."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
KINDS = {"fact", "theory", "unknown", "game_model"}
CATEGORIES = {"technique", "training", "knife", "cuisine", "history", "simulation"}

def load(name):
    path = ROOT / "data" / name
    return json.loads(path.read_text(encoding="utf-8"))

def check():
    errors = []
    sources = load("sources.json")
    cards = load("encyclopedia.json")
    presets = load("simulation_presets.json")
    for name, data in [("sources", sources), ("encyclopedia", cards), ("simulation_presets", presets)]:
        if data.get("schema_version") != 1:
            errors.append(f"{name}: unsupported schema_version")
    ids = set()
    for item in sources.get("sources", []):
        key = item.get("id")
        if not isinstance(key, str) or not key or key in ids:
            errors.append(f"invalid/duplicate source id: {key}")
        ids.add(key)
        if not str(item.get("url", "")).startswith("https://"):
            errors.append(f"invalid source URL: {key}")
        if item.get("verification") != "needs_recheck":
            errors.append(f"unexpected verification state: {key}")
    card_ids = set()
    for card in cards.get("cards", []):
        key = card.get("id")
        if not isinstance(key, str) or not key or key in card_ids:
            errors.append(f"invalid/duplicate card id: {key}")
        card_ids.add(key)
        if card.get("category") not in CATEGORIES:
            errors.append(f"invalid category: {key}")
        if card.get("evidence_type") not in KINDS:
            errors.append(f"invalid evidence_type: {key}")
        if card.get("review_status") != "draft":
            errors.append(f"unexpected review status: {key}")
        if not all(isinstance(card.get(k), str) and card[k].strip() for k in ("title", "summary")):
            errors.append(f"missing card text: {key}")
        linked = card.get("source_ids")
        if not isinstance(linked, list) or any(s not in ids for s in linked):
            errors.append(f"unresolved source reference: {key}")
        if card.get("evidence_type") != "game_model" and not linked:
            errors.append(f"source missing for non-game card: {key}")
    modes = presets.get("modes", [])
    mode_ids = [m.get("id") for m in modes]
    if set(mode_ids) != {"try", "dojo", "endless"} or len(mode_ids) != 3:
        errors.append("mode set is incomplete")
    mechanics = presets.get("mechanics", {})
    if mechanics.get("random_breaks") is not False:
        errors.append("random breaks must remain disabled in phase 0")
    if mechanics.get("depth_min_game_mm", 0) <= 0:
        errors.append("depth_min must be positive")
    if mechanics.get("depth_min_game_mm", 0) >= mechanics.get("depth_max_game_mm", 0):
        errors.append("invalid depth range")
    if not cards.get("cards") or not sources.get("sources"):
        errors.append("empty catalog")
    return errors, len(cards["cards"]), len(sources["sources"])

if __name__ == "__main__":
    try:
        issues, n_cards, n_sources = check()
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f"Data validation error: {exc}", file=sys.stderr)
        raise SystemExit(1)
    if issues:
        for msg in issues:
            print(f"ERROR: {msg}", file=sys.stderr)
        raise SystemExit(1)
    print(f"OK: {n_cards} cards, {n_sources} sources, 3 modes; JSON references and draft states valid")

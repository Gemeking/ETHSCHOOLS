import json
import sys

with open('data/universities_ethiopia.json', encoding='utf-8') as f:
    existing = json.load(f)

with open('data/new_unis.json', encoding='utf-8') as f:
    new_unis = json.load(f)

existing_ids = {u['id'] for u in existing}
added = 0
for u in new_unis:
    if u['id'] not in existing_ids:
        existing.append(u)
        added += 1
    else:
        print(f"SKIP (duplicate id {u['id']}): {u['name_en']}")

existing.sort(key=lambda u: u['id'])

with open('data/universities_ethiopia.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print(f"Done. Added {added} universities. Total: {len(existing)}")

## Context

Currently, challenges have 5 categories: subject, setting, mood, medium, and style. Artists are available in the embedded artist library (946 artists with styles/themes) but are never suggested to users. The "style" category contains generic descriptors (dramatic, realistic, stylized, etc.) rather than authentic artistic movements or epochs.

Real NightCafe Build-a-Prompt challenges follow this structure:
```
SUBJECT: [1 item]
SETTING: [1 item]
MOOD: [1 item]
ARTIST: [1 item]  ← Currently missing
MEDIUM: [1 item]
STYLE: [Art movement/epoch, not generic descriptor]
```

The markdown output format should be copy-paste friendly with numbered lists and clear category headers.

## Goals / Non-Goals

**Goals:**
- Include a required artist category in every challenge
- Use real artistic styles/movements instead of generic descriptors
- Output markdown format matches NightCafe challenge text convention for seamless copy-paste
- Maintain theme coherence (artist, style, subject etc. all align thematically)

**Non-Goals:**
- Machine learning artist recommendation (keep it simple: random from theme-compatible artists)
- Fetching artist data from external sources (use embedded library only)
- Changing dedup algorithm (can stay signature-based, just include artist in it)
- Supporting single-item categories yet (still 5 items per category by default, now includes artist)

## Decisions

### D1: Artist Selection — Random from Theme-Compatible Artists

**Decision:** When generating a challenge for a theme, randomly select an artist from those in the library whose styles intersect with the theme's style pool.

**Rationale:** Thematic coherence (Romanticism theme should not suggest a hyper-modern digital artist). Avoids need for manual artist-theme mapping. Uses existing artist.themes field already populated.

**Alternative considered:** Use all artists regardless of theme → loses thematic coherence.

---

### D2: Style Category — Real Artistic Movements, Not Generic Descriptors

**Decision:** Refactor all theme.categories['style'] to list real art movements (Romanticism, Renaissance, Art Deco, Cubism, Impressionism, Surrealism, Grunge, Cyberpunk, Steampunk, etc.) instead of descriptors like "dramatic", "realistic".

**Rationale:** Educates users on art history, aligns with NightCafe conventions, makes output more useful for actual art generation.

**Alternative considered:** Keep generic + add movements → confusing mix, fails alignment goal.

---

### D3: Artist Selection in Challenge Categories

**Decision:** Artists are added as a 6th category: `categories['artist'] = [selectedArtist.name]`. Treat it like subject/setting/mood/medium/style for dedup, output, and filtering.

**Rationale:** Consistent with existing category structure. Makes dedup more precise (same theme + items but different artist = not duplicate). Output formatters already handle dynamic categories.

---

### D4: Markdown Output Format — Numbered Lists with Category Headers

**Decision:** Markdown challenges use one bullet per category, with a comma-separated list of options, without category name as header , matching NightCafe's published challenge format.

Example:
```markdown
# 🏗️ BUILD A PROMPT 🏗️ Vikings 🛶🌳🐍

For your prompt, choose 1 item from each list below. You MAY then add ONLY 3 additional words, PLUS 1 additional artist of your choice. You MAY also use any negative prompt.
•PLEASE USE YOUR PROMPT AS YOUR ENTRY TITLE OR RISK BEING DOWNVOTED • •PLEASE VOTE FAIRLY• ✅ - Change word order, adjust weights, any negative prompt, evolve/inpaint ❌ - Presets, Uploads, NSFW, LoRAs, Creative/Clarity Upscaler, Pro models, Prompt Magic

- warrior, explorer, berserker, raider, captain
- fjord, forest, icy mountain, longship, settlement
- adventurous, fierce, harsh, noble, primal
- concept art, digital art, oil painting, sketch, watercolor
- Romanticism, Renaissance, Grunge, Cyberpunk, Dadaism
- Greg Rutkowski, Michelangelo, Egon Schiele, Paul Lehr, Gerald Brom
```

**Rationale:** Matches exact format of NightCafe challenges, enabling direct copy-paste. Users recognize the format immediately.

---

### D5: Theme Data Migration — Inline Style Refactoring

**Decision:** Manually refactor `data/themes.json` to replace all style values with real art movements. Group by theme era/aesthetic.

**Rationale:** Small one-time cost (13 themes × ~5 styles = ~65 entries). No code changes needed if structure stays the same. Alternative (dynamic style mapping) adds complexity.

---

## Risks / Trade-offs

- **User unfamiliarity with art movements** → Mitigated by README documentation with art movement examples
- **Artist not theme-compatible** → Mitigated by filtering artist.themes against theme.categories.style before random selection
- **Dedup sensitivity increases** → Mitigated by updating dedup docs to explain artist now included in signature
- **Output format change breaks downstream** → Mitigated by CLI keeping pretty-print as default (most conservative); markdown opt-in

## Migration Plan

1. Add artist as 6th category to Challenge type (no breaking change to existing fields)
2. Refactor `data/themes.json` style pools to art movements
3. Update `ChallengeGenerator.generateRandomChallenge()` to select artist before building categories
4. Update all output formatters to handle artist category (already generic, no changes needed)
5. Update README with art movement guide
6. Test: verify challenges have artist, artist aligns with theme style

Rollback: Revert `data/themes.json` to old descriptor-based styles; artist selection returns empty.

## Open Questions

- Should artist category count toward `itemsPerCategory` (i.e., `--artists 2` is invalid)? → Assume always 1 artist per challenge, not configurable
- Should theme-artist affinity be stored in data or computed at runtime? → Compute at runtime from artist.themes; simpler and requires no new data structure

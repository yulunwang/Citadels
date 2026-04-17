# Citadels — AI Image Generation Prompts

Each section below is a **self-contained copy-paste block** for your image generation AI.
The last line of every prompt contains the technical spec (dimensions, filename, Midjourney flags).

**How to use:**
- **Midjourney**: paste the full block including the last `--ar` line as your `/imagine` prompt
- **DALL-E 3 / Firefly / SD**: paste everything except the last `--ar ... --v 6` line; add
  style presets "watercolor illustration" + "medieval fantasy" manually in your tool

---

## Shared Style Suffix

Every prompt ends with this style block. It is written out in full in each entry below
(no abbreviations) so every block is fully copy-paste ready.

```
watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
```

---

---
# ══════════════════════════════════════
# CHARACTER PORTRAITS  (16 images)
# ══════════════════════════════════════
#
# OUTPUT SPEC (same for all characters):
#   Canvas  : 512 × 768 px
#   Format  : WebP, quality 82, ≤ 80 KB
#   Ratio   : 2:3  (portrait / tarot card)
#   Folder  : img/chars/
#
# COMPOSITION RULE:
#   Subject fills ~70 % of the frame.
#   Face in the upper half.
#   Lower third slightly darker (CSS name overlay goes here).
#   Works as a 256×256 center-crop for the thumbnail.
#
# THUMBNAIL EXPORT (do after generating portrait):
#   Crop to 256 × 256 px centered on the face
#   Save as WebP ≤ 20 KB in img/chars/thumb/
# ══════════════════════════════════════
---

### Assassin
```
Save as: img/chars/assassin.webp  |  Thumb: img/chars/thumb/assassin.webp

A hooded figure draped in deep crimson robes, face half-concealed beneath a dark cowl —
only glinting amber eyes visible. One slender gloved hand holds a thin curved dagger
with an ivory-and-obsidian handle, catching warm candlelight. The other hand rests on
a dark stone wall. Body angled slightly forward, radiating still controlled menace.
Elegant and poised, not monstrous. A single guttering candle casts dramatic upward
light from below-right. Background: abstract warm cream wash bleeding into dusky rose
and deep shadow at the edges, faint cobblestone silhouette.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Thief
```
Save as: img/chars/thief.webp  |  Thumb: img/chars/thumb/thief.webp

A nimble figure in ash-grey and slate-blue layered travelling clothes — a worn leather
vest over a linen shirt with rolled sleeves. A battered coin purse hangs at the belt;
one gloved hand fans a set of lockpicks with practiced ease. A knowing half-smile,
quick bright eyes that miss nothing. Dappled marketplace daylight, warm dust and gold
in the air. Background: soft cream wash with faint silver-grey tone, ghost outlines
of market stalls and passing silhouettes.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Magician
```
Save as: img/chars/magician.webp  |  Thumb: img/chars/thumb/magician.webp

A learned sorcerer in deep violet robes embroidered with silver runes, one hand raised
in a deliberate spellcasting gesture — fingertips trailing luminous violet and white
motes of light. The other hand grips a gnarled ash staff topped with a glowing amethyst
orb. Expression serene and focused, the confidence of mastery. Background: lavender
and violet mist dissolving into warm cream parchment, faint runic circle watermark
on the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### King
```
Save as: img/chars/king.webp  |  Thumb: img/chars/thumb/king.webp

A dignified monarch in sumptuous gold-trimmed crimson royal robes, wearing an ornate
crown set with rubies and sapphires. Calm, authoritative expression — the weight of
rule worn easily. One gauntleted hand rests on the jewelled pommel of a ceremonial
sword; the other holds a sealed royal decree. Rich ermine-trimmed cloak falls behind.
Warm golden throne room candlelight. Background: warm cream with radiant golden glow,
heraldic lion motifs barely visible in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Bishop
```
Save as: img/chars/bishop.webp  |  Thumb: img/chars/thumb/bishop.webp

A serene ecclesiastical figure in flowing sky-blue and ivory vestments with gold-thread
embroidery, holding a tall golden crosier topped with a cross. Gentle, wise expression —
compassion and authority in equal measure. A magnificent stained glass window behind
casts azure, cobalt, and rose light across the scene. Prayer beads coiled at the waist.
Background: soft blue-white radiance, faint sacred geometry and rose window pattern
on the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Merchant
```
Save as: img/chars/merchant.webp  |  Thumb: img/chars/thumb/merchant.webp

A prosperous merchant in a fine emerald-green wool coat with burnished brass buttons,
counting a fistful of gold coins with practiced fingers, a thick leather-bound ledger
tucked under the other arm. A warm self-satisfied smile — comfortable and clever.
Well-dressed, well-fed. Background: warm cream with faint green market-stall banners
and scattered coin silhouettes in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Architect
```
Save as: img/chars/architect.webp  |  Thumb: img/chars/thumb/architect.webp

A master builder in amber-colored work clothes — rolled sleeves, leather apron dusted
with stone chalk. One hand holds a rolled parchment blueprint, the other a brass compass
and quill. Expression absorbed and creative, eyes focused on an invisible plan. In the
soft-focus background, wooden scaffolding rises around a half-built stone tower. Warm
workshop lantern light from the left. Background: warm parchment-amber wash with faint
geometric architectural line-drawings on the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Warlord
```
Save as: img/chars/warlord.webp  |  Thumb: img/chars/thumb/warlord.webp

A seasoned military commander in campaign-worn plate armor with red lacquered pauldrons,
one gauntleted fist resting on the crossguard of a broad broadsword. A diagonal scar
across the jaw. Disciplined and fierce but not reckless — the authority of hard-won
experience. A faded red military cloak drapes one shoulder. Warm dusk light from behind
silhouettes the armor. Background: rust-red and amber wash, ghost outlines of crossed
swords and a battle standard in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Queen
```
Save as: img/chars/queen.webp  |  Thumb: img/chars/thumb/queen.webp

An elegant queen in a flowing golden brocade gown with silver filigree at the collar
and cuffs, wearing a slender crown of laurel leaves and seed pearls. Seated
three-quarters facing the viewer, one elbow on an armrest, an enigmatic half-smile
suggesting political acuity. Composed and luminous. Soft warm candlelight. Background:
warm gold wash, subtle heraldic rose motifs, the edge of a tapestry barely visible
in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Navigator
```
Save as: img/chars/navigator.webp  |  Thumb: img/chars/thumb/navigator.webp

A weather-worn seafarer in a deep navy coat with brass buttons, a worn brass compass
open in one hand, nautical charts half-unrolled in the other. Sun-browned skin,
wind-roughened hair, eyes gazing confidently toward the horizon. In the blurred
background, a tall-masted ship rolls on a dusky sea with the horizon glowing
orange-gold. Background: deep cerulean blue dissolving to cream, faint compass rose
watermark on the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Wizard
```
Save as: img/chars/wizard.webp  |  Thumb: img/chars/thumb/wizard.webp

An ancient wizard in deep amethyst robes embroidered with constellations, cradling a
luminous crystal orb in both hands — the orb swirls with violet and silver visions.
Long silver-white beard, deep-set wise eyes reflecting the orb's glow. Older and more
powerful than the Magician — a true arcane master. Floating tomes hover at the
periphery. Background: deep purple mist with stars, warm cream and gold at the borders,
cosmic motifs in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Patrician
```
Save as: img/chars/patrician.webp  |  Thumb: img/chars/thumb/patrician.webp

A patrician nobleman in sumptuous ivory-and-gold senatorial robes with purple trim,
wearing a wreath crown of gilded laurel leaves. Roman-inspired elegance — tall,
confident, slightly aloof. Holding a rolled scroll bearing a red wax seal. Warm
afternoon light through high windows. Background: warm golden wash, faint columned
hall and laurel vine motifs in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Abbot
```
Save as: img/chars/abbot.webp  |  Thumb: img/chars/thumb/abbot.webp

A humble monk in simple pale-blue linen habit with a rope belt, head slightly bowed
in prayerful serenity, hands clasped with prayer beads wound around them. Sandaled
feet on worn stone. Completely at peace. A small walled monastery garden visible
behind — herb beds, a sundial, dappled morning light through stone arches. Background:
soft blue-white wash, faint leaf and botanical motifs in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Scholar
```
Save as: img/chars/scholar.webp  |  Thumb: img/chars/thumb/scholar.webp

A young academic scholar in warm amber academic robes, surrounded by an arc of
floating open books and scrolling parchment. A quill tucked behind one ear,
ink-stained fingers, expression of absorbed delight at some discovery. Candlelit
study environment. Background: warm amber and cream wash, faint manuscript script
lettering and ink-splash motifs in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Seer
```
Save as: img/chars/seer.webp  |  Thumb: img/chars/thumb/seer.webp

A mysterious seer in flowing silver-and-violet robes, one hand outstretched displaying
an arc of glowing tarot-like illustrated cards, the other resting on a crystal orb
that pulses with inner light. Silver-streaked hair, ageless face with penetrating
knowing eyes. An air of effortless mystical authority. Background: soft violet haze
with star and crescent moon motifs on warm cream, faint card symbols in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

### Trader
```
Save as: img/chars/trader.webp  |  Thumb: img/chars/thumb/trader.webp

A sharp-eyed trade merchant behind a market counter laden with exotic goods: bolts of
colorful cloth, spice jars, small crates tied with rope. Practical green-and-brown
clothing, a leather apron. One hand rests on an abacus, the other gestures expansively.
Confident, bustling, opportunistic energy. Warm midday market light. Background: warm
green-gold wash, faint trade route map lines and merchant ship silhouette in the lower half.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark
--ar 2:3 --q 2 --stylize 150 --v 6
```

---

---
# ══════════════════════════════════════
# DISTRICT CARD ART  (35 images)
# ══════════════════════════════════════
#
# OUTPUT SPEC (same for all districts):
#   Canvas  : 512 × 342 px
#   Format  : WebP, quality 78, ≤ 40 KB
#   Ratio   : 3:2  (landscape / card art zone)
#   Folder  : img/districts/
#
# COMPOSITION RULE:
#   Architecture/scene fills the frame.
#   Sky or open space in upper 25-30%.
#   NO human figures. NO text.
#   Single dominant focal element, legible at 80px wide.
#
# THUMBNAIL EXPORT:
#   Crop to 128 × 128 px centered on the main building
#   Save as WebP ≤ 8 KB in img/districts/thumb/
# ══════════════════════════════════════
---

## Yellow — Noble Districts

### Manor
```
Save as: img/districts/manor.webp  |  Thumb: img/districts/thumb/manor.webp

A picturesque country manor house with pale stone walls and a warm terracotta tiled
roof, set among rolling green lawns and flower gardens. Warm summer afternoon light,
long golden shadows. Ivy climbing the walls. A gravel path leads to an arched front
door. Pastoral, gentle wealth. Sky: soft golden-cream haze occupying upper 25%.
Color dominant: warm ochre and honey-stone.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Castle
```
Save as: img/districts/castle.webp  |  Thumb: img/districts/thumb/castle.webp

An imposing medieval castle on a rocky hilltop — four corner towers with crenellated
battlements, a raised portcullis, a gold-and-crimson banner snapping in the wind.
Dramatic warm sunset light from behind sets the stone walls glowing amber-gold.
A broad stone bridge leads to the gatehouse. Sky: amber and rose gradient, upper 25%.
Color dominant: warm grey stone, amber sunset glow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Palace
```
Save as: img/districts/palace.webp  |  Thumb: img/districts/thumb/palace.webp

A magnificent palatial residence — gleaming white marble colonnades, a central golden
dome, formal symmetrical gardens with fountains visible in the foreground. Warm midday
light. Grand, opulent, restrained elegance. Sky: pale blue dissolving into cream, upper 25%.
Color dominant: ivory-white marble, gold dome, manicured emerald green.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

## Blue — Religious Districts

### Temple
```
Save as: img/districts/temple.webp  |  Thumb: img/districts/thumb/temple.webp

A simple but beautiful stone temple with a wide portico of carved columns, paper
lanterns hanging at the entrance, thin incense smoke curling upward. Serene dawn light.
Mossy stone steps lead up. A stone basin of clear water in the foreground. Sky: soft
golden-pink dawn, upper 25%. Color dominant: grey-blue stone, warm golden lantern glow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Church
```
Save as: img/districts/church.webp  |  Thumb: img/districts/thumb/church.webp

A modest village church in pale limestone with a square bell tower, a simple arched
wooden door, clear glass windows catching morning mist. A small wrought-iron fence
partially visible at the side. Quiet and community-hearted. Sky: pale blue-grey mist,
upper 25%. Color dominant: pale cream-grey stone, soft green grass.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Monastery
```
Save as: img/districts/monastery.webp  |  Thumb: img/districts/thumb/monastery.webp

A peaceful walled monastery on a gentle hillside — a low stone complex around a
central courtyard garden with a stone well, herb beds, and a gnarled pear tree.
Cell windows visible in the walls. Midday golden light. Contemplative silence.
Sky: pale blue, upper 25%. Color dominant: warm buff stone, deep green garden.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Cathedral
```
Save as: img/districts/cathedral.webp  |  Thumb: img/districts/thumb/cathedral.webp

A soaring Gothic cathedral filling the frame — pointed spires reaching skyward, flying
buttresses curving elegantly, an enormous rose window blazing with cobalt, azure, and
gold stained glass in late-afternoon sunlight. Sheer vertical grandeur.
Sky: pale gold, upper 25%. Color dominant: blue-grey stone, jewel-toned stained glass.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

## Green — Trade Districts

### Tavern
```
Save as: img/districts/tavern.webp  |  Thumb: img/districts/thumb/tavern.webp

A cozy roadside tavern — a two-storey timber-framed building with warm amber light
pouring from small leaded windows into evening dusk, a painted wooden sign swinging
above the door depicting a foaming tankard, barrels stacked under the eaves.
Welcoming and convivial. Sky: deep dusk blue, upper 25%.
Color dominant: warm amber glow, dark timber frame.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Market
```
Save as: img/districts/market.webp  |  Thumb: img/districts/thumb/market.webp

A bustling open-air market square — colorful striped awnings over wooden stalls piled
with produce, cloth bolts, and hanging goods. Pennants strung between posts flutter
in the breeze. Midday summer light, saturated and rich. Prosperous atmosphere.
Sky: bright warm blue, upper 25%. Color dominant: jewel-toned awnings, cream stone.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Trading Post
```
Save as: img/districts/trading_post.webp  |  Thumb: img/districts/thumb/trading_post.webp

A compact roadside trading post at a crossroads — stone-and-timber building with a
covered porch, crates and barrels stacked outside, a painted sign with a hanging scale.
A worn dirt road stretches to the horizon in warm afternoon haze.
Sky: warm pale blue haze, upper 25%. Color dominant: warm ochre, aged timber, green grass.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Docks
```
Save as: img/districts/docks.webp  |  Thumb: img/districts/thumb/docks.webp

Wooden river docks extending into calm amber-lit water at dawn — rowboats and small
cargo vessels tied to weathered posts, coiled ropes, fishing nets hanging to dry.
Morning mist on the water. Quiet working atmosphere.
Sky: pale rose-amber dawn, upper 25%.
Color dominant: aged grey-brown timber, amber-gold water reflections.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Harbor
```
Save as: img/districts/harbor.webp  |  Thumb: img/districts/thumb/harbor.webp

A busy coastal harbor at golden sunset — two tall-masted merchant ships at anchor,
rigging silhouetted against an orange-rose sky, smaller boats moving between them.
Quayside stone warehouses with warm lit windows. Sky: orange-rose sunset, upper 30%.
Color dominant: deep cerulean water, amber-rose sky.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Town Hall
```
Save as: img/districts/town_hall.webp  |  Thumb: img/districts/thumb/town_hall.webp

A civic town hall in dressed stone — a symmetrical facade with arched windows, a
central clock tower with a bronze bell, broad stone steps leading up to tall wooden
doors. A public square fountain in the foreground. Sky: pale blue, upper 25%.
Color dominant: warm grey stone, emerald clock face.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

## Red — Military Districts

### Watchtower
```
Save as: img/districts/watchtower.webp  |  Thumb: img/districts/thumb/watchtower.webp

A lone cylindrical stone watchtower rising from a rocky cliff edge, a signal fire
blazing at the crenellated top, sparks rising into a dramatic stormy sky. A winding
path snakes up the cliff face below. Sky: dramatic grey-violet storm sky, upper 30%.
Color dominant: grey-black stone, fierce amber fire.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Prison
```
Save as: img/districts/prison.webp  |  Thumb: img/districts/thumb/prison.webp

A forbidding stone prison building — thick walls with iron-barred slit windows, a heavy
oak-and-iron door, a single torchsconce casting harsh downward shadows. Damp grey stone,
moss in the mortar. Cold overcast light. Sky: cold grey, upper 25%.
Color dominant: grey stone, deep shadow, cold blue-grey cast.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Battlefield
```
Save as: img/districts/battlefield.webp  |  Thumb: img/districts/thumb/battlefield.webp

An open field in the grey of early dawn — abandoned shields, spears planted in churned
earth, and helmets half-buried in mud. A torn crimson battle standard in the middle
distance. Sparse grass bending in a cold wind. Somber and memorial, not gory.
Sky: pale cold dawn, upper 30%. Color dominant: grey-brown earth, rust-red banner.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Fortress
```
Save as: img/districts/fortress.webp  |  Thumb: img/districts/thumb/fortress.webp

An imposing military fortress in dark iron-grey stone — massive walls with arrow slits,
a wide moat reflecting a blood-red sunset sky, a heavy iron portcullis, angular bastions
at each corner. Formidable and unyielding. Sky: blood-red sunset, upper 30%.
Color dominant: dark iron-grey, blood-red sky, black shadow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

## Purple — Unique Districts

### Haunted City
```
Save as: img/districts/haunted_city.webp  |  Thumb: img/districts/thumb/haunted_city.webp

The ethereal ruins of a once-great city — crumbling towers and archways glowing with
spectral violet-blue light, wispy ghost-lights drifting between the columns. Thick fog
hugs the ground. Haunting and beautiful, mysterious not terrifying.
Sky: deep indigo with moonlight, upper 25%.
Color dominant: deep violet, spectral blue-white glow, cream moonlight.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Factory
```
Save as: img/districts/factory.webp  |  Thumb: img/districts/thumb/factory.webp

A compact medieval-industrial workshop — stone walls fitted with spinning copper gears
and brass clockwork mechanisms visible through barred windows, a chimney venting
amber-glowing steam. Equal parts forge and engineering marvel.
Sky: warm amber steam haze, upper 25%. Color dominant: bronze and brass, amber glow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Dragon Gate
```
Save as: img/districts/dragon_gate.webp  |  Thumb: img/districts/thumb/dragon_gate.webp

An ornate ceremonial gate of carved dark stone flanked by two rearing dragon sculptures,
their eyes inlaid with glowing amber gems, wings spread above the arch. Red-lacquered
wooden doors behind. Lanterns hanging from the dragon claws. Dramatic and mythic.
Sky: deep red-orange, upper 25%.
Color dominant: dark stone, red lacquer, amber and gold accents.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### University
```
Save as: img/districts/university.webp  |  Thumb: img/districts/thumb/university.webp

A grand academic hall in honey-colored stone — a courtyard seen through an arched
entrance, a domed library building rising behind, candles glowing in tall arched
windows at dusk. Scholarly and impressive.
Sky: deep blue evening with early stars, upper 25%.
Color dominant: warm honey stone, deep blue sky, warm candlelight.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Thieves' Den
```
Save as: img/districts/thieves_den.webp  |  Thumb: img/districts/thumb/thieves_den.webp

A shadowy alley entrance in a city — a cunningly disguised door set into a stone wall,
barely visible, marked only by a faint chalk symbol above the lintel. A single lantern
barely illuminates the alcove. Stacked crates and barrels conceal the entry.
Secretive, hidden in plain sight. Sky: deep night above, upper 25%.
Color dominant: deep shadow and grey stone, single amber lantern glow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Keep
```
Save as: img/districts/keep.webp  |  Thumb: img/districts/thumb/keep.webp

A solid square defensive keep tower of rough-hewn grey granite — murder holes visible
above the arched entrance, a heavy iron-reinforced door banded with dark metal. Ivy
beginning to claim the lower stones. Impregnable and permanent.
Sky: overcast grey, upper 25%. Color dominant: grey granite, deep shadow, creeping green ivy.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Graveyard
```
Save as: img/districts/graveyard.webp  |  Thumb: img/districts/thumb/graveyard.webp

A peaceful walled graveyard at dusk — weathered stone crosses and carved angels among
copper autumn leaves, a wrought-iron gate standing open, a single lantern on a stone
post. Thin fog along the ground. Melancholy but serene.
Sky: violet-grey dusk, upper 25%. Color dominant: grey stone, amber lantern, autumn copper.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Observatory
```
Save as: img/districts/observatory.webp  |  Thumb: img/districts/thumb/observatory.webp

A tall circular stone observatory tower at night, the domed roof retracted to reveal
a great brass telescope aimed at a star-filled sky. Warm amber light glows in the
windows below. The Milky Way arcs overhead. Wonder and discovery.
Sky: deep indigo-black with stars, upper 40%.
Color dominant: deep night sky, star-silver, warm amber tower light.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Smithy
```
Save as: img/districts/smithy.webp  |  Thumb: img/districts/thumb/smithy.webp

An active forge at night — a roaring coal furnace blazing fierce orange-red light,
hammers and tongs hanging on the wall, an iron anvil in the center, sparks frozen
mid-flight. Brick and stone walls black with soot. Raw, powerful, essential.
No sky visible (interior). Color dominant: blazing amber-orange fire, iron grey.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Library
```
Save as: img/districts/library.webp  |  Thumb: img/districts/thumb/library.webp

A magnificent library interior — towering shelves of leather-bound volumes rising to
a vaulted ceiling, wooden sliding ladders on rails, dozens of candles in chandelier
clusters, a spiral iron staircase in the center. Looking slightly upward, shelves
receding into warm amber haze. Interior composition.
Color dominant: warm amber candlelight, dark oak shelving, cream and burgundy spines.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### School of Magic
```
Save as: img/districts/school_of_magic.webp  |  Thumb: img/districts/thumb/school_of_magic.webp

An arcane academy building at twilight — a circular stone tower covered in glowing runic
inscriptions that pulse violet and azure, windows revealing floating candles and orbiting
books inside, a shimmering magical barrier over the arched entrance. Mystical and impressive.
Sky: deep purple twilight, upper 25%.
Color dominant: violet and blue glow, grey stone, silver rune-light.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Wishing Well
```
Save as: img/districts/wishing_well.webp  |  Thumb: img/districts/thumb/wishing_well.webp

A magical wishing well in a moonlit garden clearing — a low stone circle with a carved
arch and rope-and-bucket, the water inside glowing softly with golden-blue light,
ancient coins shimmering at the bottom. Fireflies drift in the warm air.
Sky: violet twilight with moon, upper 25%.
Color dominant: glowing gold-blue well, deep green garden, violet twilight.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Map Room
```
Save as: img/districts/map_room.webp  |  Thumb: img/districts/thumb/map_room.webp

A circular cartography study — a great brass-and-wood globe on a central stand, the
floor inlaid with a compass rose mosaic, maps pinned and layered on every wall, a wide
table covered in charts, rulers, and sextants. A round skylight lets in warm afternoon
light. Interior composition.
Color dominant: warm amber, aged parchment maps, brass instruments.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Secret Vault
```
Save as: img/districts/secret_vault.webp  |  Thumb: img/districts/thumb/secret_vault.webp

A hidden chamber revealed by a swung-open concealed door in a stone wall — beyond it,
rows of ornate wooden chests and shelves of coin sacks in torchlight, a single torch
casting dramatic shadows on treasure. The concealed door mechanism still visible.
Interior composition. Color dominant: deep shadow, amber torchlight, gold gleam.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Great Wall
```
Save as: img/districts/great_wall.webp  |  Thumb: img/districts/thumb/great_wall.webp

A massive stone defensive wall stretching across a mountain pass viewed from slightly
above — crenellated battlements, watchtowers at intervals, the wall curving along the
ridge into distant haze. Dramatic alpine light. Monumental and enduring.
Sky: pale dramatic sky, upper 30%. Color dominant: grey stone, green-brown mountain.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Quarry
```
Save as: img/districts/quarry.webp  |  Thumb: img/districts/thumb/quarry.webp

An active stone quarry — terraced rock faces of pale limestone carved into geometric
steps, wooden cranes with rope pulleys, freshly cut stone blocks waiting on the ground.
Midday sunlight, white stone dust catching the light. Industry and material wealth.
Sky: bright warm blue, upper 25%. Color dominant: pale cream-white limestone, bright sunlight.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Basilica
```
Save as: img/districts/basilica.webp  |  Thumb: img/districts/thumb/basilica.webp

A magnificent basilica in white marble and gold — a wide columned portico, an arched
central entrance sheathed in gilded mosaic depicting celestial scenes, twin bell towers
flanking the facade. Warm late-afternoon light turning the white marble honey-gold.
Sky: deep rich blue, upper 25%. Color dominant: white marble, deep gold mosaic.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Capitol
```
Save as: img/districts/capitol.webp  |  Thumb: img/districts/thumb/capitol.webp

A grand civic capitol building — wide colonnaded entrance, a central dome of copper
turned verdigris-green with age, broad stone steps, two flags flying above the portico.
Clear midday light. Authority and civic pride.
Sky: deep blue, upper 25%. Color dominant: warm grey stone, verdigris dome, white marble.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

### Ivory Tower
```
Save as: img/districts/ivory_tower.webp  |  Thumb: img/districts/thumb/ivory_tower.webp

A slender, impossibly elegant white stone tower rising alone from a coastal cliff edge —
narrow arched windows spiraling upward, the very top lost in wispy clouds. Grey-blue sea
far below. Beautiful and isolated, a symbol of singular ambition.
Sky: pale soft blue fading to white near the cloud, upper 40%.
Color dominant: ivory white stone, soft grey cloud, blue-grey sea.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 3:2 --q 1 --stylize 100 --v 6
```

---

---
# ══════════════════════════════════════
# BACKGROUND SCENES  (4 images)
# ══════════════════════════════════════
#
# OUTPUT SPEC (same for all backgrounds):
#   Canvas  : 1920 × 1080 px
#   Format  : WebP, quality 72, ≤ 200 KB
#   Ratio   : 16:9  (widescreen)
#   Folder  : img/bg/
#
# COMPOSITION RULE:
#   No human figures. No text of any kind.
#   Architectural or environmental only.
#   Edges can blur or fade — CSS vignette overlays on top.
#   Strong central depth/perspective.
#   Must look good with semi-transparent UI panels overlaid.
#   Muted, not overly busy.
# ══════════════════════════════════════
---

### Lobby Background
```
Save as: img/bg/lobby.webp

A grand medieval banquet hall viewed from eye level — warm golden candlelight from
enormous iron chandeliers, long oak tables with white linen, rich tapestries on
dressed stone walls depicting heraldic hunting scenes, a vaulted stone ceiling with
carved bosses. Empty and awaiting guests. Strong central perspective leading deep
into the hall. Muted enough for UI panels to overlay comfortably.
Color dominant: rich amber-gold light, warm cream stone, deep shadow at the margins.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 16:9 --q 1 --stylize 75 --v 6
```

---

### In-Game Background
```
Save as: img/bg/game.webp

A birds-eye view of an imaginary medieval city seen as a living illustrated map — a
patchwork of district buildings viewed from directly above: manor rooftops, a church
spire, market awnings, a watchtower, a harbor in one corner. Parchment texture
underlying the scene. Soft hand-drawn map aesthetic. Very muted and subtle so it does
not compete with UI elements layered on top.
Color dominant: parchment cream, warm rooftile terracotta, slate grey, soft green.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 16:9 --q 1 --stylize 75 --v 6
```

---

### Draft Background
```
Save as: img/bg/draft.webp

A candlelit circular table covered in deep green baize felt, character role cards fanned
out face-down in the center — only their ornate backs visible, decorated with a golden
fleur-de-lis pattern. Other players' hands barely visible at the frame edges. A single
tall candle in the center. Intimate and secretive — the moment before choosing.
Color dominant: deep green felt, golden card backs, amber candlelight, dark surrounding shadow.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 16:9 --q 1 --stylize 75 --v 6
```

---

### Game Over Background
```
Save as: img/bg/gameover.webp

A celebratory medieval great hall at a victory feast — colorful heraldic banners of
many colors hanging from the rafters, golden light from roaring fireplaces and blazing
chandeliers, long tables set with gold plate and raised goblets. Empty of people but
filled with the warm energy of recent celebration. Radiant and triumphant.
Color dominant: radiant gold, crimson and sapphire banners, warm cream stone, firelight.

watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
cream parchment paper texture, fine ink linework, detailed expressive brushwork,
tarot card illustration style, airy and luminous atmosphere, soft romantic mood,
rich jewel-tone accents on cream background
--no photorealistic anime chibi grimdark horror neon sci-fi 3d render cgi photography text watermark humans people figures
--ar 16:9 --q 1 --stylize 75 --v 6
```

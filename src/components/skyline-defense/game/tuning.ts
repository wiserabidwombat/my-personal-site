// Every gameplay number in one place. Speeds and sizes that should feel the
// same on a phone and a desktop are fractions of the world's height or
// width rather than fixed pixels.
//
// TODO(balance): all of these are first guesses, not playtested. Tune the
// meteor speeds, counts, spawn gaps, split chances, ammo, interceptor
// speed, and blast radius by playing a few waves at 1280px and ~390px.
export const TUNING = {
  // Meteor speed at wave 1 and added per wave, as a fraction of world
  // height per second (0.07 = crosses the sky in ~14s).
  meteorSpeedBase: 0.07,
  meteorSpeedPerWave: 0.012,
  meteorSpeedMax: 0.2,
  meteorCountBase: 8,
  meteorCountPerWave: 2,
  // Seconds between meteor spawns.
  spawnIntervalBase: 1.6,
  spawnIntervalPerWave: 0.12,
  spawnIntervalMin: 0.45,
  // Splitting meteors start on this wave; chance per meteor grows per wave.
  splitStartWave: 3,
  splitChanceBase: 0.15,
  splitChancePerWave: 0.05,
  splitChanceMax: 0.5,
  splitFragments: 3,
  // Degrees between neighboring fragments of a split meteor: they fan out
  // from the split point around the parent's heading, starting close
  // enough to catch in one blast.
  splitFanDegrees: 9,
  // Salvos: meteors arriving in small groups that start close together
  // (in time and position) and fan out as they fall, so one blast or a
  // chain can take several. Chance that a spawn is a salvo, by wave: mostly
  // singles in wave 1, common from waves 2-3.
  salvoChanceBase: 0.12,
  salvoChancePerWave: 0.22,
  salvoChanceMax: 0.7,
  // Salvo size: 2, or 3 with this chance.
  salvoTripleChance: 0.4,
  // Start spacing between neighbors, in full blast radii (so salvos are
  // equally catchable on any screen), and seconds between their starts.
  salvoSpacing: 0.9,
  salvoTimeGap: 0.2,
  // Degrees between neighbors' headings as they fall.
  salvoFanDegrees: 4,
  ammoPerLauncher: 10,
  // Fraction of world height per second.
  interceptorSpeed: 0.85,
  // Full blast radius (a radius, not a diameter): a fraction of the canvas
  // height, since meteors cover the same share of the height per second on
  // every screen, so blasts are equally forgiving on phone and desktop
  // (~44px at 1280x741, ~47px at 390x791). Also capped at a fraction of
  // the width so very tall, narrow screens don't get screen-wide blasts,
  // and clamped to px for extreme sizes.
  blastRadiusHeightFraction: 0.06,
  blastRadiusMaxWidthFraction: 0.14,
  blastRadiusMin: 28,
  blastRadiusMax: 72,
  // Blast lifetime in seconds, like classic Missile Command: grow to full
  // radius, hold, then shrink. Lethal for the whole lifetime (1.6s),
  // shrinking included, so blasts linger long enough to chain.
  blastGrow: 0.4,
  blastHold: 0.7,
  blastShrink: 0.5,
  // A meteor destroyed by a blast leaves its own blast, this fraction of a
  // full blast's radius, with the same lifecycle.
  chainRadiusFraction: 0.8,
  impactRadius: 16,
  meteorPoints: 25,
  buildingBonus: 100,
  ammoBonus: 5,
  // Wide-screen pressure. Meteor speed is already a fraction of the canvas
  // height, so meteors take the same time to fall at every size; what a
  // desktop has extra is width (more sky, bigger blasts). From
  // widePressureStartWave on, each wave's meteor count and speed get
  // (1 + wideness * perWave * wavesSinceStart), where wideness runs from 0
  // at widePressureMinWidth (phones unaffected) to 1 at
  // widePressureFullWidth and wider.
  widePressureStartWave: 3,
  widePressureMinWidth: 430,
  widePressureFullWidth: 1280,
  // Calibrated against a human-like simulated player (~20% lead error,
  // 0.25s reaction delay) so 1280px tracks 390px: city kept ~99% in wave
  // 1, ~90-95% in waves 3-4, ~65-70% in wave 6 on both.
  widePressureCountPerWave: 0.1,
  widePressureSpeedPerWave: 0.04,
  // Chain bonus: every kill caused by a blast descended from one shot counts
  // toward that shot's chain; the Nth kill in a chain scores xN, up to this.
  chainMultiplierCap: 8,
  // Seconds a score popup stays up after its last update (a chain's popup
  // updates on every kill, so it lingers this long after the chain ends),
  // and the length of its scale "pop" on each chain update.
  popupSeconds: 0.8,
  popupPopSeconds: 0.15,
  // Bonus targets (harmless; the only cost of chasing them is ammo). Points
  // are multiplied by the wave multiplier and the chain multiplier.
  // UFO: one pass per wave from ufoStartWave, sometimes a second from
  // ufoSecondPassWave. Delays are seconds into the wave's play.
  ufoStartWave: 2,
  ufoDelayMin: 3,
  ufoDelayMax: 9,
  ufoSecondPassWave: 5,
  ufoSecondPassChance: 0.35,
  ufoSecondPassGapMin: 6,
  ufoSecondPassGapMax: 10,
  // Seconds to cross the screen (much faster than a meteor falls, so it
  // needs leading), and its width as a share of the world's width.
  ufoCrossSeconds: 4.5,
  ufoSizeFraction: 0.05,
  ufoSizeMin: 40,
  ufoSizeMax: 64,
  ufoPoints: 500,
  // Scouts: about one group per wave from scoutStartWave.
  scoutStartWave: 3,
  scoutGroupChance: 0.85,
  scoutDelayMin: 4,
  scoutDelayMax: 12,
  scoutCountMin: 3,
  scoutCountMax: 5,
  scoutCrossSeconds: 7,
  scoutSize: 18,
  // Spacing between scouts in chain blast radii (< 1, so one scout's blast
  // reaches the next), and their wobble: amplitude as a share of the sky
  // band's height, and cycles per second.
  scoutSpacing: 0.85,
  scoutWobble: 0.06,
  scoutWobbleHz: 0.7,
  scoutPoints: 100,
  // Boss wave: every bossEvery-th wave (5, 10, 15, ...) a Mega-meteor
  // replaces the wave's normal spawns. "Appearance" counts boss waves (1 at
  // wave 5, 2 at wave 10, ...); health, fragments per hit, and descent
  // speed grow per appearance up to their caps.
  //
  // Balanced with the simulated players (npm run sim, 300 runs): the human
  // player (the standard) destroys the wave-5 boss in every run at both
  // reference sizes, keeping 90% (1280x741) / 82% (390x791) of the city.
  // At wave 10 on a phone the fight ends ~9% of the human runs that get
  // there and ~25% of the slow player's (the fragments and trickle get
  // through while it shoots the boss), and the wave-15 boss ends almost
  // every slow run. The sim player shoots the boss as soon as it appears,
  // so it almost never lands; health is what makes later bosses dangerous
  // (it keeps the player busy while fragments fall), speed is what
  // punishes ignoring it. Human run length is unchanged (mean wave 8.46 vs
  // 8.48 at 1280x741, 10.74 vs 10.27 at 390x791).
  // TODO(balance): the slow player (perfect aim, one shot per 0.8s) on a
  // phone now averages wave 11.8, down from 15.3; confirm by playtesting
  // whether later bosses are too harsh for deliberate players.
  bossEvery: 5,
  bossHealthBase: 6,
  bossHealthPerAppearance: 3,
  bossHealthMax: 17,
  bossFragmentsBase: 2,
  bossFragmentsPerAppearance: 1,
  bossFragmentsMax: 5,
  // Fraction of world height per second: if never hit, appearance 1 reaches
  // the tallest tower in ~10-11s, appearance 3 in ~5s.
  bossSpeedBase: 0.05,
  bossSpeedPerAppearance: 0.03,
  bossSpeedMax: 0.12,
  // Drawn radius: a share of the height, capped by a share of the width,
  // clamped to px (~56px at 1280x741, ~43px at 390x791): always larger
  // than a full blast. Hits are checked against radius x bossHitScale, so a
  // blast grazing the glow still counts (generous for taps on a phone).
  bossRadiusHeightFraction: 0.075,
  bossRadiusMaxWidthFraction: 0.11,
  bossRadiusMin: 30,
  bossRadiusMax: 72,
  bossHitScale: 1.2,
  // After each hit: seconds it hangs still, how far it's knocked back up
  // (fraction of world height), and seconds of the white hit flash. Kept
  // small: a bigger stall/knockback let steady fire hold the boss in place.
  bossStallSeconds: 0.2,
  bossKnockback: 0.004,
  bossFlashSeconds: 0.18,
  // Fragments shed per hit fan out from the boss's underside this many
  // degrees apart, at the wave's meteor speed. The killing hit sheds
  // bossKillFragmentScale times as many, and leaves a blast this many full
  // blast radii wide.
  bossFragmentFanDegrees: 16,
  bossKillFragmentScale: 2,
  bossExplosionScale: 1.8,
  // Reaching the city: every building whose center is within this share of
  // the world width of the impact point goes dark. The flash is this many
  // full blast radii, and the screen shakes this long (not under
  // prefers-reduced-motion).
  bossImpactRadiusFraction: 0.2,
  bossImpactFlashScale: 4,
  bossShakeSeconds: 0.6,
  // A light trickle of normal (single) meteors while the boss is alive:
  // one every bossTrickleInterval seconds, at most bossTrickleMax a wave.
  bossTrickleInterval: 3,
  bossTrickleMax: 14,
  // Points: for the kill (~4 UFOs, for a target that takes 8+ hits) and
  // the end-of-wave bonus for destroying it before it lands. Both are
  // multiplied by the wave multiplier (not the chain multiplier).
  // Boss waves use the normal ammoPerLauncher: in the sim they end with
  // more ammo left than the normal wave before them.
  bossPoints: 2000,
  bossBonus: 1000,
  // Seconds on the "Wave N" title and the between-wave bonus screen.
  waveTitleTime: 1.6,
  waveBonusTime: 2.4,
  // Keyboard crosshair speed, in world pixels per second.
  crosshairSpeed: 420,
} as const

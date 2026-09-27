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
  // Blast radius as a fraction of the world's width, clamped to px. Meteors
  // fall at about the same px/s on phones and desktops, so the minimum
  // keeps phone blasts big enough to match desktop: in a simulated wave 1
  // (a player with ~10px tap error), 38 keeps ~99% of the city at 360-430px
  // wide vs 100% at 1280px; 26 kept only ~85%.
  blastRadiusFraction: 0.05,
  blastRadiusMin: 38,
  // ~5% of the width on desktop (64px at 1280px), so chains are easier to
  // set up where the sky is wide.
  blastRadiusMax: 64,
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
  widePressureCountPerWave: 0.2,
  widePressureSpeedPerWave: 0.08,
  // Seconds on the "Wave N" title and the between-wave bonus screen.
  waveTitleTime: 1.6,
  waveBonusTime: 2.4,
  // Keyboard crosshair speed, in world pixels per second.
  crosshairSpeed: 420,
} as const

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
  ammoPerLauncher: 10,
  // Fraction of world height per second.
  interceptorSpeed: 0.85,
  // Blast radius as a fraction of the world's width, clamped to px.
  blastRadiusFraction: 0.045,
  blastRadiusMin: 26,
  blastRadiusMax: 46,
  // Blast lifetime in seconds: grow, hold, shrink.
  blastGrow: 0.35,
  blastHold: 0.25,
  blastShrink: 0.3,
  impactRadius: 16,
  meteorPoints: 25,
  buildingBonus: 100,
  ammoBonus: 5,
  // Seconds on the "Wave N" title and the between-wave bonus screen.
  waveTitleTime: 1.6,
  waveBonusTime: 2.4,
  // Keyboard crosshair speed, in world pixels per second.
  crosshairSpeed: 420,
} as const

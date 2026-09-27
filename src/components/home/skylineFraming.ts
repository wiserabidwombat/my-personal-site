// Size and framing shared by all four skyline images in src/assets
// (dallas-skyline, dallas-skyline-light, skyline-halloween-dark,
// skyline-halloween-light). The Reunion Tower hotspot (ReunionHotspot.tsx)
// is positioned from these numbers, so every variant must keep this exact
// size and framing -- an image with a different crop or size needs these
// updated to match.
export const SKYLINE_IMAGE = { width: 2172, height: 724 } as const

// Center and diameter of Reunion Tower's ball, in the image's own pixels.
export const REUNION_BALL = { x: 444, y: 220, diameter: 80 } as const

// Mobile height of every skyline <img> (SkylineImages.tsx). Below sm the
// image is height-cropped and pinned left, so the hotspot's frame uses the
// same height to scale the ball's position the same way.
export const skylineMobileHeight = 'h-56'

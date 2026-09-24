import { describe, expect, it } from 'vitest'
import { imageAltText } from './fossils'

describe('imageAltText', () => {
  it('turns an image caption into alt text, trimming the lead-in', () => {
    expect(imageAltText('The image shows a large, highly textured mineral specimen.')).toBe('A large, highly textured mineral specimen.')
    expect(imageAltText('The selected region highlights a radiating orange creedite crystal cluster.')).toBe(
      'A radiating orange creedite crystal cluster.',
    )
    expect(imageAltText('Deep purple structure like a coral.')).toBe('Deep purple structure like a coral.')
  })

  it('rejects long write-ups and chat transcripts', () => {
    expect(imageAltText('x'.repeat(251))).toBeNull()
    expect(imageAltText('AI Mode Conversation: trilobite You sent: 1 image')).toBeNull()
    expect(imageAltText('   ')).toBeNull()
    expect(imageAltText(null)).toBeNull()
  })
})

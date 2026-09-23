import { useState } from 'react'

// Shared by the Resume page and the Contact page's Resume card. jsPDF is a
// large library only needed for this one interaction -- a dynamic import
// keeps it out of both routes' initial chunks, so visitors who never click
// download never pay for it.
export function useResumePdfDownload() {
  const [generating, setGenerating] = useState(false)

  async function download() {
    setGenerating(true)
    try {
      const { generateResumePdf } = await import('../lib/generate-resume-pdf')
      generateResumePdf()
    } finally {
      setGenerating(false)
    }
  }

  return { download, generating }
}

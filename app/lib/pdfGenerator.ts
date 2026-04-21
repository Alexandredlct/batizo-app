import { PDFDocument } from 'pdf-lib'

export async function genererPDF(params: any, devisElementId: string) {
  const { default: html2canvas } = await import('html2canvas')
  const { default: jsPDF } = await import('jspdf')

  const finalPdf = await PDFDocument.create()

  // 1. Page de garde
  if (params.gardeActive && params.gardePdf) {
    try {
      const gardeBytes = base64ToBytes(params.gardePdf)
      const gardePdf = await PDFDocument.load(gardeBytes)
      const pages = await finalPdf.copyPages(gardePdf, gardePdf.getPageIndices())
      pages.forEach(p => finalPdf.addPage(p))
    } catch (e) { console.warn('Erreur page de garde:', e) }
  }

  // 2. Générer le devis en PDF depuis le DOM
  const element = document.getElementById(devisElementId)
  if (element) {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = 210
    const pageH = 297
    const imgW = pageW
    const imgH = (canvas.height * pageW) / canvas.width
    let posY = 0
    let pageNum = 0
    const totalPages = Math.ceil(imgH / pageH)
    while (posY < imgH) {
      if (pageNum > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -posY, imgW, imgH)
      posY += pageH
      pageNum++
    }
    const devisBytes = pdf.output('arraybuffer')
    const devisPdf = await PDFDocument.load(devisBytes)
    const pages = await finalPdf.copyPages(devisPdf, devisPdf.getPageIndices())
    pages.forEach(p => finalPdf.addPage(p))
  }

  // 3. Pages complémentaires filtrées (type='devis')
  const pagesComp: any[] = params.pagesComp || []
  for (const page of pagesComp) {
    if (!page.active || !page.devis || !page.data) continue
    try {
      const bytes = base64ToBytes(page.data)
      const compPdf = await PDFDocument.load(bytes)
      const pages2 = await finalPdf.copyPages(compPdf, compPdf.getPageIndices())
      pages2.forEach(p => finalPdf.addPage(p))
    } catch (e) { console.warn(`Erreur page ${page.nom}:`, e) }
  }

  // Télécharger
  const pdfBytes = await finalPdf.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `devis-${new Date().toISOString().split('T')[0]}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

function base64ToBytes(base64: string): Uint8Array {
  const b64 = base64.includes(',') ? base64.split(',')[1] : base64
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

import { PDFDocument } from 'pdf-lib'

export async function genererPDF(params: any, devisElementId: string, nomFichier?: string) {
  const element = document.getElementById(devisElementId)
  if (!element) return

  // Construire le pied de page légal
  const p = params as any
  const parts: string[] = [p.nomEntreprise || ''].filter(Boolean)
  if (p.formeJuridique) parts.push(p.formeJuridique)
  if (p.capitalSocial) parts.push('Capital ' + p.capitalSocial)
  if (p.rcs) parts.push('RCS ' + (p.ville || '') + ' ' + p.rcs)
  if (p.siret) parts.push('SIRET : ' + p.siret)
  if (p.tvaIntra) parts.push('TVA : ' + p.tvaIntra)
  if (p.decennale) parts.push('Décennale N° ' + p.decennale)
  const footerText = parts.join(' — ')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Devis</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${p.police || 'system-ui, sans-serif'};
    font-size: 13px;
    color: #333;
    background: #fff;
  }

  /* Footer fixe en bas de chaque page */
  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 0.5px solid #999;
    padding-top: 8px;
    padding-bottom: 6px;
    padding-left: 20px;
    padding-right: 20px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .page-footer .footer-text {
    font-size: 9px;
    color: #1A1A1A;
    font-weight: 400;
    line-height: 1.4;
    flex: 1;
  }
  .page-footer .footer-page {
    font-size: 9px;
    color: #1A1A1A;
    white-space: nowrap;
    margin-left: 16px;
  }

  /* Contenu avec espace pour le footer */
  .page-content {
    margin-bottom: 40px;
    min-height: calc(297mm - 40px);
    display: flex;
    flex-direction: column;
  }
  .content-inner {
    flex: 1;
  }

  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    html, body { width: 210mm; }
    .page-footer {
      position: fixed;
      bottom: 8mm;
      left: 15mm;
      right: 15mm;
    }
    .page-content {
      padding: 15mm;
      padding-bottom: 25mm;
    }
  }

  /* Copier les styles du devis */
  table { width: 100%; border-collapse: collapse; }
  
  /* Masquer les éléments d'édition */
  .edit-only { display: none !important; }
  button { display: none !important; }
  input[type="number"] { display: none !important; }
  select { display: none !important; }
</style>
</head>
<body>
  <div class="page-content">
    <div class="content-inner">
      ${element.outerHTML}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-text">${footerText}</span>
    <span class="footer-page" id="page-num"></span>
  </div>
  <script>
    // Masquer éléments interactifs
    document.querySelectorAll('button, input, select, textarea').forEach(el => {
      el.style.display = 'none';
    });
    // Masquer la barre d'ajout
    document.querySelectorAll('[data-edit-only]').forEach(el => {
      el.style.display = 'none';
    });
    window.onload = () => {
      window.print();
      window.onafterprint = () => window.close();
    };
  </script>
</body>
</html>`

  // Ouvrir fenêtre d'impression
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour télécharger le PDF')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
}

function base64ToBytes(base64: string): Uint8Array {
  const b64 = base64.includes(',') ? base64.split(',')[1] : base64
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function assemblerAvecPagesCompl(params: any, devisBlob: Blob) {
  const finalPdf = await PDFDocument.create()

  // Page de garde
  if (params.gardeActive && params.gardePdf) {
    try {
      const bytes = base64ToBytes(params.gardePdf)
      const gardePdf = await PDFDocument.load(bytes)
      const pages = await finalPdf.copyPages(gardePdf, gardePdf.getPageIndices())
      pages.forEach(p => finalPdf.addPage(p))
    } catch (e) { console.warn('Erreur page de garde:', e) }
  }

  // Devis principal
  try {
    const devisBytes = new Uint8Array(await devisBlob.arrayBuffer())
    const devisPdf = await PDFDocument.load(devisBytes)
    const pages = await finalPdf.copyPages(devisPdf, devisPdf.getPageIndices())
    pages.forEach(p => finalPdf.addPage(p))
  } catch (e) { console.warn('Erreur devis:', e) }

  // Pages complémentaires
  const pagesComp: any[] = params.pagesComp || []
  for (const page of pagesComp) {
    if (!page.active || !page.devis || !page.data) continue
    try {
      const bytes = base64ToBytes(page.data)
      const compPdf = await PDFDocument.load(bytes)
      const pages2 = await finalPdf.copyPages(compPdf, compPdf.getPageIndices())
      pages2.forEach(p => finalPdf.addPage(p))
    } catch (e) { console.warn(`Erreur ${page.nom}:`, e) }
  }

  const pdfBytes = await finalPdf.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `devis-${new Date().toISOString().split('T')[0]}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

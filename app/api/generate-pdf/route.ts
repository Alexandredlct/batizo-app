import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export const maxDuration = 60

function fmt(n: number): string {
  const hasDecimals = Math.abs(n) % 1 > 0.001
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
    useGrouping: true
  }) + '\u00A0\u20AC'
}

function buildHTML(data: any): string {
  const { params: p = {}, lignes = [], client, titre, introTexte, dateDevis,
    validite, numeroDevis, adresseProjet, adresseMode, moyens = {},
    acomptes = [], mentionsLegales, notes, remises = [], prime, logoPreview } = data

  const col = p.couleurPrincipale || '#1D9E75'

  const calcHT = (l: any): number => {
    if (l.type === 'ouvrage') {
      if (l.prixManuel && l.prixForce != null) return (l.qte || 1) * l.prixForce
      return ((l.lignesInternes || []).reduce((s: number, li: any) => s + li.qte * li.pu, 0)) * (l.qte || 1)
    }
    if (['materiau', 'mo'].includes(l.type)) return (l.qte || 0) * (l.pu || 0)
    return 0
  }

  const totalHT = lignes.reduce((s: number, l: any) => s + calcHT(l), 0)
  const totalRemises = remises.reduce((s: number, r: any) => s + (r.isPct ? totalHT * r.val / 100 : r.val), 0)
  const totalHTapresRemises = totalHT - totalRemises

  const tvaVentilee: Record<string, number> = {}
  lignes.forEach((l: any) => {
    const ht = calcHT(l)
    if (!ht) return
    const taux = parseFloat((l.tva || '0%').replace('%', ''))
    if (!taux) return
    const remPct = totalHT > 0 ? totalRemises / totalHT : 0
    const key = taux.toString()
    tvaVentilee[key] = (tvaVentilee[key] || 0) + ht * (1 - remPct) * taux / 100
  })
  const totalTVA = Object.values(tvaVentilee).reduce((s, v) => s + v, 0)
  const totalTTC = totalHTapresRemises + totalTVA
  const resteAPayer = totalTTC - (prime?.val || 0)

  const getNumero = (arr: any[], idx: number): string => {
    let cat = 0, sub = 0, line = 0, lastCat = 0, lastSub = 0
    for (let i = 0; i <= idx; i++) {
      const l = arr[i]
      if (l.type === 'categorie') { cat++; sub = 0; line = 0; lastCat = cat; lastSub = 0 }
      else if (l.type === 'sous-categorie') { sub++; line = 0; lastSub = sub }
      else if (['materiau', 'mo', 'ouvrage'].includes(l.type)) line++
    }
    const l = arr[idx]
    if (l.type === 'categorie') return `${cat}`
    if (l.type === 'sous-categorie') return `${lastCat}.${sub}`
    if (['materiau', 'mo', 'ouvrage'].includes(l.type)) {
      if (lastSub > 0) return `${lastCat}.${lastSub}.${line}`
      if (lastCat > 0) return `${lastCat}.${line}`
      return `${line}`
    }
    return ''
  }

  const getSousTotal = (idx: number): number => {
    let total = 0
    const isCat = lignes[idx]?.type === 'categorie'
    for (let i = idx + 1; i < lignes.length; i++) {
      if (lignes[i].type === 'categorie') break
      if (!isCat && lignes[i].type === 'sous-categorie') break
      total += calcHT(lignes[i])
    }
    return total
  }

  const footerParts: string[] = [p.nomEntreprise || ''].filter(Boolean)
  if (p.formeJuridique) footerParts.push(p.formeJuridique)
  if (p.capitalSocial) footerParts.push('Capital ' + p.capitalSocial)
  if (p.rcs) footerParts.push('RCS ' + (p.ville || '') + ' ' + p.rcs)
  if (p.siret) footerParts.push('SIRET\u00A0: ' + p.siret)
  if (p.tvaIntra) footerParts.push('TVA\u00A0: ' + p.tvaIntra)
  if (p.decennale) footerParts.push('D\u00E9cennale N\u00B0\u00A0' + p.decennale)
  const footerText = footerParts.join(' \u2014 ')

  const moyensArr: string[] = []
  if (moyens.especes) moyensArr.push('esp\u00E8ces')
  if (moyens.cheque) moyensArr.push('ch\u00E8que')
  if (moyens.virement) moyensArr.push('virement bancaire')
  if (moyens.carte) moyensArr.push('carte bleue')
  let moyensTexte = ''
  if (moyensArr.length === 1) moyensTexte = `Paiement par ${moyensArr[0]}.`
  else if (moyensArr.length > 1) {
    const last = moyensArr[moyensArr.length - 1]
    moyensTexte = `Paiement par ${moyensArr.slice(0, -1).join(', ')} ou par ${last}.`
  }

  let lignesHTML = ''
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i]
    const ht = calcHT(l)
    const num = getNumero(lignes, i)

    if (l.type === 'saut-page') {
      lignesHTML += `<tr style="page-break-after:always;"><td colspan="6"></td></tr>`
      continue
    }
    if (l.type === 'note') {
      if (!l.texte) continue
      lignesHTML += `<tr><td colspan="6" style="padding:6px 0;font-size:13px;color:#555;font-style:italic;">${l.texte}</td></tr>`
      continue
    }
    if (l.type === 'categorie' || l.type === 'sous-categorie') {
      const isSub = l.type === 'sous-categorie'
      const bg = isSub ? col + '22' : col + '44'
      const st = getSousTotal(i)
      if (i > 0) lignesHTML += `<tr><td colspan="6" style="height:${isSub ? 12 : 32}px;"></td></tr>`
      lignesHTML += `<tr style="background:${bg};">
        <td style="padding:6px 16px;font-size:14px;color:#333;">${num}</td>
        <td colspan="3" style="padding:6px 16px;font-size:14px;color:#333;">${l.titre || ''}</td>
        <td></td>
        <td style="padding:6px 16px;font-size:14px;font-weight:500;color:#333;">${fmt(st)}</td>
      </tr>`
      continue
    }
    lignesHTML += `<tr><td colspan="6" style="height:16px;"></td></tr>`
    lignesHTML += `<tr style="vertical-align:top;">
      <td style="padding:8px 12px;width:60px;border-right:1px solid #d0d0d0;font-size:13px;color:#666;">${num}</td>
      <td style="padding:8px 12px;border-right:1px solid #d0d0d0;">
        <div style="font-size:14px;font-weight:500;color:#333;">${l.designation || ''}</div>
        ${l.description ? `<div style="font-size:13px;color:#555;font-style:italic;line-height:1.5;margin-top:2px;">${l.description}</div>` : ''}
      </td>
      <td style="padding:8px 12px;width:70px;border-right:1px solid #d0d0d0;font-size:14px;color:#333;">${l.qte || 0}&nbsp;${l.unite || ''}</td>
      <td style="padding:8px 12px;width:90px;border-right:1px solid #d0d0d0;font-size:14px;color:#333;">${fmt(l.pu || 0)}</td>
      <td style="padding:8px 12px;width:70px;border-right:1px solid #d0d0d0;font-size:14px;color:#333;">${(l.tva || '20%').replace('%', '&nbsp;%')}</td>
      <td style="padding:8px 12px;width:100px;font-size:14px;color:#333;">${fmt(ht)}</td>
    </tr>`
  }

  const sigH = p.tailleSignature === 'petit' ? 60 : p.tailleSignature === 'grand' ? 120 : 90

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:210mm;font-family:${p.police||'Helvetica,Arial,sans-serif'};font-size:13px;color:#333;background:#fff;}
.wrap{padding:15mm 15mm 28mm 15mm;min-height:297mm;display:flex;flex-direction:column;}
.content{flex:1;}
.footer{position:fixed;bottom:8mm;left:15mm;right:15mm;border-top:0.5px solid #999;padding-top:8px;display:flex;justify-content:space-between;background:#fff;}
.footer span{font-size:9px;color:#1A1A1A;line-height:1.4;}
table{width:100%;border-collapse:collapse;}
thead{display:table-header-group;}
@page{size:A4;margin:0;}
</style></head><body>
<div class="wrap"><div class="content">

<table style="margin-bottom:16px;"><tr>
<td style="width:50%;padding-right:20px;vertical-align:top;">
  ${logoPreview ? `<img src="${logoPreview}" style="height:48px;max-width:160px;object-fit:contain;display:block;margin-bottom:10px;">` : ''}
  <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:6px;">${p.nomEntreprise || ''}${p.showFormeJuridique && p.formeJuridique ? ' \u2014 ' + p.formeJuridique : ''}</div>
  <div style="font-size:12px;color:#555;line-height:1.8;">
    ${p.showAdresse && p.adresseLigne1 ? `<div>${p.adresseLigne1}${p.codePostal ? ' ' + p.codePostal : ''}${p.ville ? ' ' + p.ville : ''}</div>` : ''}
    ${p.showTel && p.tel ? `<div>${p.tel}</div>` : ''}
    ${p.showEmail && p.email ? `<div>${p.email}</div>` : ''}
    ${p.showSiteWeb && p.siteWeb ? `<div>${p.siteWeb}</div>` : ''}
  </div>
</td>
<td style="width:50%;vertical-align:top;">
  ${client ? `<div style="background:#f3f4f6;border-radius:8px;padding:12px 14px;font-size:12px;color:#555;line-height:1.9;">
    <div style="font-size:14px;font-weight:700;color:#111;">${client.nom.split('—')[0].trim()}</div>
    ${client.nom.includes('—') ? `<div style="font-size:12px;color:#888;">${client.nom.split('—')[1].trim()}</div>` : ''}
    ${client.adresse ? `<div>${client.adresse}</div>` : ''}
    ${client.email ? `<div>${client.email}</div>` : ''}
    ${client.tel ? `<div>${client.tel}</div>` : ''}
    ${client.siret ? `<div style="color:#888;font-size:11px;">SIRET&nbsp;: ${client.siret}</div>` : ''}
  </div>` : ''}
</td></tr></table>

<div style="padding:10px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;display:flex;gap:24px;margin-bottom:12px;flex-wrap:wrap;">
  ${numeroDevis ? `<div><div style="font-size:11px;color:#444;font-weight:500;">Devis n\u00B0</div><div style="font-size:13px;font-weight:700;">${numeroDevis}</div></div>` : ''}
  ${dateDevis ? `<div><div style="font-size:11px;color:#444;font-weight:500;">Date</div><div style="font-size:12px;">${new Date(dateDevis).toLocaleDateString('fr-FR')}</div></div>` : ''}
  ${validite ? `<div><div style="font-size:11px;color:#444;font-weight:500;">Validit\u00E9</div><div style="font-size:12px;">${validite}</div></div>` : ''}
  ${adresseMode && adresseMode !== 'hidden' && adresseProjet ? `<div><div style="font-size:11px;color:#444;font-weight:500;">Adresse du projet</div><div style="font-size:12px;">${adresseProjet}</div></div>` : ''}
</div>

${titre ? `<div style="text-align:center;padding:10px 0;font-size:15px;font-style:italic;color:#555;">${titre}</div>` : ''}
${introTexte ? `<div style="padding:8px 0 12px;font-size:13px;color:#555;font-style:italic;">${introTexte}</div>` : ''}

<table>
<thead><tr style="border-bottom:1px solid #e5e7eb;">
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;width:60px;border-right:1px solid #d0d0d0;">N\u00B0</th>
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;border-right:1px solid #d0d0d0;">D\u00E9signation</th>
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;width:70px;border-right:1px solid #d0d0d0;">Qt\u00E9</th>
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;width:90px;border-right:1px solid #d0d0d0;">PU HT</th>
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;width:70px;border-right:1px solid #d0d0d0;">TVA</th>
  <th style="padding:10px 12px;font-size:14px;font-weight:500;color:#333;text-align:left;width:100px;">Total HT</th>
</tr></thead>
<tbody>${lignesHTML}</tbody>
</table>

<table style="margin-top:16px;"><tr>
<td style="width:60%;padding:16px 0;vertical-align:top;padding-right:24px;">
  ${moyensTexte ? `<div style="font-size:13px;color:#333;margin-bottom:10px;">${moyensTexte}</div>` : ''}
  ${acomptes.map((a: any) => {
    const types: Record<string, string> = { signature: 'Acompte \u00E0 la signature de', intermediaire: 'Versement interm\u00E9diaire de', solde: 'Solde \u00E0 r\u00E9ception de chantier' }
    return `<div style="font-size:13px;color:#333;margin-bottom:6px;">${types[a.type] || ''} ${a.pct}&nbsp;%, soit ${fmt(resteAPayer * a.pct / 100)}.</div>`
  }).join('')}
  ${mentionsLegales ? `<div style="font-size:12px;color:#555;font-style:italic;line-height:1.6;margin-top:8px;">Je certifie que les travaux r\u00E9alis\u00E9s sont \u00E9ligibles au taux de TVA r\u00E9duit de 5,5&nbsp;% ou 10&nbsp;% et respectent les conditions pr\u00E9vues par les articles 279-0 bis et 278-0 bis A du Code G\u00E9n\u00E9ral des Imp\u00F4ts.</div>` : ''}
  ${notes ? `<div style="font-size:13px;color:#555;font-style:italic;margin-top:8px;">${notes}</div>` : ''}
</td>
<td style="width:40%;padding:16px 0;vertical-align:top;">
  <table style="width:100%;">
    ${totalRemises > 0 ? `<tr><td style="font-size:13px;color:#333;padding:2px 0;">Sous-total HT</td><td style="font-size:13px;color:#333;">${fmt(totalHT)}</td></tr>
    ${remises.map((r: any) => `<tr><td style="font-size:13px;color:#333;padding:2px 0;">${r.label || 'Remise'}</td><td style="font-size:13px;color:#D32F2F;">- ${fmt(r.isPct ? totalHT * r.val / 100 : r.val)}</td></tr>`).join('')}` : ''}
    <tr><td style="font-size:13px;font-weight:600;color:#333;padding:2px 0;">Total HT</td><td style="font-size:13px;font-weight:600;color:#333;">${fmt(totalHTapresRemises)}</td></tr>
    ${Object.entries(tvaVentilee).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])).map(([taux, mt]) => `<tr><td style="font-size:13px;color:#555;padding:2px 0;">TVA \u00E0 ${taux}&nbsp;%</td><td style="font-size:13px;color:#555;">${fmt(mt as number)}</td></tr>`).join('')}
    <tr><td colspan="2" style="padding:3px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
    <tr><td style="font-size:13px;font-weight:600;color:#333;padding:2px 0;">Total TTC</td><td style="font-size:13px;font-weight:600;color:#333;">${fmt(totalTTC)}</td></tr>
    ${prime && prime.val > 0 ? `<tr><td style="font-size:13px;color:#333;padding:2px 0;">${prime.label || 'Prime'}</td><td style="font-size:13px;color:#D32F2F;">- ${fmt(prime.val)}</td></tr>
    <tr><td style="font-size:14px;font-weight:700;color:#111;padding:5px 0 2px;">Reste \u00E0 payer</td><td style="font-size:14px;font-weight:700;color:#111;">${fmt(resteAPayer)}</td></tr>` : ''}
  </table>
</td></tr></table>

<table style="margin-top:24px;"><tr>
<td style="width:50%;padding-right:16px;text-align:center;vertical-align:top;">
  <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;">${p.texteClient || 'Le client'}</div>
  <div style="font-size:12px;color:#555;line-height:1.5;min-height:36px;margin-bottom:8px;">${p.mentionClient || "Devis re\u00E7u avant l'ex\u00E9cution des travaux. Bon pour travaux."}</div>
  <div style="border:1px solid #e5e7eb;border-radius:8px;height:${sigH}px;"></div>
</td>
<td style="width:50%;padding-left:16px;text-align:center;vertical-align:top;">
  <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;">${p.nomSignataireEntreprise || p.nomEntreprise || "L'entreprise"}</div>
  <div style="font-size:12px;color:#555;line-height:1.5;min-height:36px;margin-bottom:8px;">${p.mentionEntreprise || ''}</div>
  <div style="position:relative;border:1px solid #e5e7eb;border-radius:8px;height:${sigH}px;">
    ${p.cachet ? `<img src="${p.cachet}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-height:80%;max-width:80%;opacity:0.35;object-fit:contain;">` : ''}
  </div>
</td></tr></table>

</div></div>
<div class="footer">
  <span style="flex:1;">${footerText}</span>
</div>
</body></html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { params: devisParams, ...devisData } = body
    const html = buildHTML({ params: devisParams, ...devisData })

    let browser: any
    if (process.env.NODE_ENV === 'production') {
      const chromium = (await import('@sparticuz/chromium-min')).default
      const puppeteer = (await import('puppeteer-core')).default
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(
          'https://github.com/Sparticuz/chromium/releases/download/v147.0.0/chromium-v147.0.0-pack.tar'
        ),
        headless: true,
      })
    } else {
      const puppeteer = (await import('puppeteer')).default
      browser = await puppeteer.launch({ headless: true })
    }

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    await browser.close()

    const finalPdf = await PDFDocument.create()

    if (devisParams?.gardeActive && devisParams?.gardePdf) {
      try {
        const b64 = devisParams.gardePdf.includes(',') ? devisParams.gardePdf.split(',')[1] : devisParams.gardePdf
        const gardePdf = await PDFDocument.load(Buffer.from(b64, 'base64'))
        const pages = await finalPdf.copyPages(gardePdf, gardePdf.getPageIndices())
        pages.forEach((p: any) => finalPdf.addPage(p))
      } catch (e) { console.warn('Garde:', e) }
    }

    const devisPdf = await PDFDocument.load(pdfBuffer)
    const devisPages = await finalPdf.copyPages(devisPdf, devisPdf.getPageIndices())
    devisPages.forEach((p: any) => finalPdf.addPage(p))

    for (const pg of (devisParams?.pagesComp || [])) {
      if (!pg.active || !pg.devis || !pg.data) continue
      try {
        const b64 = pg.data.includes(',') ? pg.data.split(',')[1] : pg.data
        const compPdf = await PDFDocument.load(Buffer.from(b64, 'base64'))
        const pages2 = await finalPdf.copyPages(compPdf, compPdf.getPageIndices())
        pages2.forEach((p: any) => finalPdf.addPage(p))
      } catch (e) { console.warn(`Page ${pg.nom}:`, e) }
    }

    const finalBytes = await finalPdf.save()
    const date = new Date().toISOString().split('T')[0]
    const nom = devisData.numeroDevis ? `Devis_${devisData.numeroDevis}_${date}` : `Devis_${date}`

    return new NextResponse(finalBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nom}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF error:', error)
    return NextResponse.json({ error: error.message || 'Erreur' }, { status: 500 })
  }
}

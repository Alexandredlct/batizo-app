'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

const BD = '#e5e7eb', G = '#1D9E75'

const FONTS = ['system-ui','Arial','Helvetica','Georgia','Times New Roman','Courier New']
const SIZES = ['10','11','12','13','14','16','18','20','24']
const COLORS = ['#111','#555','#888','#E24B4A','#2563eb','#1D9E75','#BA7517','#9333ea']
const HIGHLIGHTS = ['#fffbeb','#f0fdf4','#eff6ff','#fef2f2','#fdf4ff','transparent']

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  singleLine?: boolean
  style?: React.CSSProperties
  defaultFont?: string
}

export default function RichTextEditor({ value, onChange, placeholder, readOnly, singleLine, style, defaultFont }: Props) {
  const [focused, setFocused] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<'text'|'bg'|null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdating = useRef(false)

  // Sync value → DOM (une seule fois au mount ou changement externe)
  useEffect(() => {
    if (!editorRef.current || isUpdating.current) return
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    handleChange()
  }

  const handleChange = useCallback(() => {
    if (!editorRef.current) return
    isUpdating.current = true
    onChange(editorRef.current.innerHTML)
    setTimeout(() => { isUpdating.current = false }, 0)
  }, [onChange])

  const queryState = (cmd: string) => {
    try { return document.queryCommandState(cmd) } catch { return false }
  }

  const Btn = ({ cmd, val, title, children, active }: { cmd?: string, val?: string, title: string, children: any, active?: boolean }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); if (cmd) exec(cmd, val) }}
      style={{
        width: 26, height: 26, border: 'none', borderRadius: 4, cursor: 'pointer',
        background: active ?? (cmd ? queryState(cmd) : false) ? '#e5e7eb' : 'transparent',
        color: '#333', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0
      }}
    >{children}</button>
  )

  const Sep = () => <div style={{ width: 1, height: 18, background: BD, margin: '0 2px', flexShrink: 0 }} />

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Toolbar */}
      {focused && !readOnly && (
        <div
          onMouseDown={e => e.preventDefault()}
          style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            background: '#fff', border: `1px solid ${BD}`, borderRadius: 8,
            padding: '4px 6px', display: 'flex', alignItems: 'center',
            gap: 2, flexWrap: 'wrap' as const, zIndex: 300,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginBottom: 4
          }}
        >
          {/* Police */}
          <select
            onMouseDown={e => e.preventDefault()}
            onChange={e => { exec('fontName', e.target.value) }}
            defaultValue={defaultFont || 'system-ui'}
            style={{ height: 24, border: `1px solid ${BD}`, borderRadius: 4, fontSize: 11, outline: 'none', background: '#fff', cursor: 'pointer', maxWidth: 100 }}
          >
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Taille */}
          <select
            onMouseDown={e => e.preventDefault()}
            onChange={e => { exec('fontSize', e.target.value) }}
            defaultValue="3"
            style={{ height: 24, width: 44, border: `1px solid ${BD}`, borderRadius: 4, fontSize: 11, outline: 'none', background: '#fff', cursor: 'pointer' }}
          >
            {SIZES.map((s, i) => <option key={s} value={String(i + 1)}>{s}</option>)}
          </select>

          <Sep />

          {/* Formatage */}
          <Btn cmd="bold" title="Gras (Ctrl+B)"><strong>B</strong></Btn>
          <Btn cmd="italic" title="Italique (Ctrl+I)"><em>I</em></Btn>
          <Btn cmd="underline" title="Souligné (Ctrl+U)"><u>U</u></Btn>
          <Btn cmd="strikeThrough" title="Barré"><s>S</s></Btn>
          <Btn cmd="removeFormat" title="Effacer formatage">T<sub style={{fontSize:8}}>x</sub></Btn>

          <Sep />

          {/* Alignement */}
          <Btn cmd="justifyLeft" title="Aligner à gauche">⬛︎</Btn>
          <Btn cmd="justifyCenter" title="Centrer">≡</Btn>
          <Btn cmd="justifyRight" title="Aligner à droite">▥</Btn>
          <Btn cmd="justifyFull" title="Justifier">☰</Btn>

          <Sep />

          {/* Listes */}
          <Btn cmd="insertUnorderedList" title="Liste à puces">•</Btn>
          <Btn cmd="insertOrderedList" title="Liste numérotée">1.</Btn>

          {/* Indentation */}
          <Btn cmd="outdent" title="Diminuer retrait">⇤</Btn>
          <Btn cmd="indent" title="Augmenter retrait">⇥</Btn>

          <Sep />

          {/* Couleur texte */}
          <div style={{ position: 'relative' }}>
            <button
              type="button" title="Couleur du texte"
              onMouseDown={e => { e.preventDefault(); setShowColorPicker(showColorPicker === 'text' ? null : 'text') }}
              style={{ width: 26, height: 26, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>A</span>
              <div style={{ width: 16, height: 3, background: '#E24B4A', borderRadius: 1 }} />
            </button>
            {showColorPicker === 'text' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, padding: 6, display: 'flex', flexWrap: 'wrap' as const, gap: 4, zIndex: 400, width: 120 }}>
                {COLORS.map(col => (
                  <div key={col} onMouseDown={e => { e.preventDefault(); exec('foreColor', col); setShowColorPicker(null) }}
                    style={{ width: 20, height: 20, borderRadius: 4, background: col, cursor: 'pointer', border: '1px solid #e5e7eb' }} />
                ))}
              </div>
            )}
          </div>

          {/* Surlignage */}
          <div style={{ position: 'relative' }}>
            <button
              type="button" title="Couleur de surlignage"
              onMouseDown={e => { e.preventDefault(); setShowColorPicker(showColorPicker === 'bg' ? null : 'bg') }}
              style={{ width: 26, height: 26, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>A</span>
              <div style={{ width: 16, height: 3, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 1 }} />
            </button>
            {showColorPicker === 'bg' && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, padding: 6, display: 'flex', flexWrap: 'wrap' as const, gap: 4, zIndex: 400, width: 120 }}>
                {HIGHLIGHTS.map(col => (
                  <div key={col} onMouseDown={e => { e.preventDefault(); exec('hiliteColor', col); setShowColorPicker(null) }}
                    style={{ width: 20, height: 20, borderRadius: 4, background: col || '#fff', cursor: 'pointer', border: '1px solid #e5e7eb' }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone édition */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setShowColorPicker(null) }}
        onInput={handleChange}
        style={{
          outline: 'none',
          minHeight: singleLine ? undefined : 32,
          fontFamily: defaultFont || 'system-ui',
          fontSize: 13,
          color: '#111',
          lineHeight: 1.6,
          cursor: readOnly ? 'default' : 'text',
          ...style,
        }}
      />
      {!value && placeholder && !focused && (
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', color: '#aaa', fontSize: 13, fontStyle: 'italic', fontFamily: defaultFont || 'system-ui' }}>
          {placeholder}
        </div>
      )}
    </div>
  )
}

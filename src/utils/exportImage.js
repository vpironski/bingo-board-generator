// Board export — renders cells to canvas directly (no html2canvas dependency).
// All drawing is synchronous so the iOS user-gesture context is preserved when
// calling navigator.share() immediately afterwards.

const DIFF_COLORS = { 1: '#4ade80', 2: '#facc15', 3: '#fb923c', 4: '#ef4444' }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawCellText(ctx, text, cx, cy, maxWidth, lineHeight) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  if (lines.length > 4) lines.length = 4

  const startY = cy - ((lines.length - 1) * lineHeight) / 2
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, startY + i * lineHeight, maxWidth)
  }
}

function renderBoardToCanvas(cells, size) {
  const DPR = 2
  const CELL = size <= 5 ? 80 : size <= 7 ? 66 : 56
  const GAP = 3
  const PAD = 10
  const gridPx = size * CELL + (size - 1) * GAP
  const total = gridPx + PAD * 2

  const canvas = document.createElement('canvas')
  canvas.width = total * DPR
  canvas.height = total * DPR
  const ctx = canvas.getContext('2d')
  ctx.scale(DPR, DPR)

  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, total, total)

  const fs = size <= 3 ? 12 : size <= 5 ? 10 : size <= 7 ? 8 : 7

  for (const cell of cells) {
    const x = PAD + cell.col * (CELL + GAP)
    const y = PAD + cell.row * (CELL + GAP)
    const isFree = cell.entryId === null

    ctx.fillStyle = isFree ? '#e5e7eb' : cell.marked ? '#4f46e5' : '#ffffff'
    roundRect(ctx, x, y, CELL, CELL, 8)
    ctx.fill()

    if (!cell.marked) {
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      roundRect(ctx, x, y, CELL, CELL, 8)
      ctx.stroke()
    }

    ctx.fillStyle = isFree ? '#6b7280' : cell.marked ? '#ffffff' : '#111827'
    ctx.font = `600 ${fs}px -apple-system, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    drawCellText(ctx, cell.name, x + CELL / 2, y + CELL / 2, CELL - 10, fs + 4)

    if (!isFree && !cell.marked && cell.difficulty && DIFF_COLORS[cell.difficulty]) {
      ctx.fillStyle = DIFF_COLORS[cell.difficulty]
      ctx.beginPath()
      ctx.arc(x + CELL - 6, y + CELL - 6, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas
}

function dataUrlToBlob(dataUrl) {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const bytes = atob(b64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 200)
}

/**
 * Renders the board to a PNG and shares (iOS) or downloads (desktop).
 * Canvas rendering is synchronous, preserving the iOS gesture context for share.
 *
 * @param {object[]} cells
 * @param {number} size
 * @param {string} filename
 * @param {{ onSuccess: Function, onError: Function }} callbacks
 */
export function exportBoard(cells, size, filename, { onSuccess, onError }) {
  try {
    const canvas = renderBoardToCanvas(cells, size)
    const dataUrl = canvas.toDataURL('image/png')
    const blob = dataUrlToBlob(dataUrl)
    const file = new File([blob], `${filename}.png`, { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], title: filename })
        .then(() => onSuccess())
        .catch(err => {
          if (err.name !== 'AbortError') triggerDownload(blob, filename)
          onSuccess()
        })
    } else {
      triggerDownload(blob, filename)
      onSuccess()
    }
  } catch (err) {
    onError(err)
  }
}

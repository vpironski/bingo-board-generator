const DIFFICULTY_MAP = {
  '1': 1, '2': 2, '3': 3, '4': 4,
  'easy': 1, 'medium': 2, 'hard': 3, 'insane': 4,
}

/**
 * Tokenizes a CSV string into rows of fields using a RFC 4180 state machine.
 * Handles quoted fields containing commas, newlines, and escaped quotes ("").
 * @param {string} str — normalized to \n line endings
 * @returns {string[][]}
 */
function tokenize(str) {
  const rows = []
  let row = []
  let field = ''
  let state = 'FIELD_START' // FIELD_START | IN_FIELD | IN_QUOTED | AFTER_QUOTE

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]

    if (state === 'FIELD_START') {
      if (ch === '"') {
        state = 'IN_QUOTED'
      } else if (ch === ',') {
        row.push(field)
        field = ''
      } else if (ch === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += ch
        state = 'IN_FIELD'
      }
    } else if (state === 'IN_FIELD') {
      if (ch === ',') {
        row.push(field)
        field = ''
        state = 'FIELD_START'
      } else if (ch === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
        state = 'FIELD_START'
      } else {
        field += ch
      }
    } else if (state === 'IN_QUOTED') {
      if (ch === '"') {
        // Peek ahead: "" is an escaped quote inside a quoted field
        if (str[i + 1] === '"') {
          field += '"'
          i++
        } else {
          state = 'AFTER_QUOTE'
        }
      } else {
        field += ch
      }
    } else if (state === 'AFTER_QUOTE') {
      if (ch === ',') {
        row.push(field)
        field = ''
        state = 'FIELD_START'
      } else if (ch === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
        state = 'FIELD_START'
      }
      // Malformed: character after closing quote that isn't , or \n — skip it
    }
  }

  // Flush last field and row
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

/**
 * Parses a raw CSV string into valid Entry objects and a list of skipped row reasons.
 * Accepts difficulty as label (Easy/Medium/Hard/Insane, case-insensitive) or number (1–4).
 * Skips the header row if present (first field lowercased === "name").
 *
 * @param {string} rawString
 * @returns {{ valid: Array<{name: string, category: string, difficulty: number}>, skipped: string[] }}
 */
export function parseCSV(rawString) {
  if (!rawString?.trim()) return { valid: [], skipped: [] }

  const normalized = rawString.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows = tokenize(normalized).filter(row => !(row.length === 1 && row[0] === ''))

  if (!rows.length) return { valid: [], skipped: [] }

  // Detect and skip header row
  let dataRows = rows
  if (rows[0][0]?.trim().toLowerCase() === 'name') {
    dataRows = rows.slice(1)
  }

  const valid = []
  const skipped = []

  dataRows.forEach((row, i) => {
    const lineNum = i + 2 // 1-indexed, accounting for header

    if (row.length < 3) {
      skipped.push(`Line ${lineNum}: expected 3 columns, got ${row.length}`)
      return
    }

    const name = row[0].trim()
    const category = row[1].trim()
    const diffRaw = row[2].trim().toLowerCase()

    if (!name) {
      skipped.push(`Line ${lineNum}: name is empty`)
      return
    }
    if (!category) {
      skipped.push(`Line ${lineNum}: category is empty`)
      return
    }

    const difficulty = DIFFICULTY_MAP[diffRaw]
    if (!difficulty) {
      skipped.push(`Line ${lineNum}: invalid difficulty "${row[2].trim()}" — use Easy, Medium, Hard, Insane, or 1–4`)
      return
    }

    valid.push({ name, category, difficulty })
  })

  return { valid, skipped }
}

/**
 * Returns a CSV template string with a header and 3 example rows.
 * Uses \r\n line endings (standard for CSV files opened in Excel/Numbers).
 * @returns {string}
 */
export function generateTemplate() {
  return [
    'Name,Category,Difficulty',
    'Eiffel Tower,Paris,Easy',
    'Mount Fuji,Japan,Hard',
    'Pasta Carbonara,Food,Medium',
  ].join('\r\n') + '\r\n'
}

import Papa from 'papaparse'

export function exportToCSV<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  const headers = columns.map((c) => c.label)
  const rows = data.map((item) => columns.map((c) => String(item[c.key] ?? '')))

  const csv = Papa.unparse({
    fields: headers,
    data: rows,
  })

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function importCSV<T extends string = string>(
  file: File,
  columns: { key: T; label: string }[]
): Promise<Record<T, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors.map((e) => e.message).join(', ')))
          return
        }

        // Creer un mapping label -> key pour reconvertir les en-tetes CSV
        const labelToKey = new Map<string, T>()
        for (const col of columns) {
          labelToKey.set(col.label.toLowerCase().trim(), col.key)
        }

        const mapped = results.data.map((row) => {
          const out = {} as Record<T, string>
          for (const [header, value] of Object.entries(row)) {
            const key = labelToKey.get(header.toLowerCase().trim())
            if (key) {
              out[key] = value ?? ''
            }
          }
          return out
        })

        resolve(mapped)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

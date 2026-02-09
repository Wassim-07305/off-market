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

export function importCSV<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors.map((e) => e.message).join(', ')))
        } else {
          resolve(results.data)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

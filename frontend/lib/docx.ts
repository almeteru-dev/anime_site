import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import mammoth from "mammoth"

const DOCS_DIR = path.resolve(process.cwd(), "..", "docs")

export const loadDocxAsHtml = cache(async (filename: string) => {
  const docxPath = path.resolve(DOCS_DIR, filename)
  const buffer = await fs.readFile(docxPath)
  const result = await mammoth.convertToHtml({ buffer })
  return result.value
})

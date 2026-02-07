import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data')

/**
 * Read data from a JSON file
 */
export function readData(filename) {
  try {
    const filePath = join(DATA_DIR, `${filename}.json`)
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message)
    return null
  }
}

/**
 * Write data to a JSON file
 */
export function writeData(filename, data) {
  try {
    const filePath = join(DATA_DIR, `${filename}.json`)
    writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message)
    return false
  }
}

/**
 * Get next ID for a collection
 */
export function getNextId(items) {
  if (!items || items.length === 0) return 1
  return Math.max(...items.map(item => item.id)) + 1
}

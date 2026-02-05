import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import 'whatwg-fetch' // Required for CodeGrade
import { Blob } from 'node:buffer' // Fix for Node 16 issues

afterEach(() => {
  cleanup()
})

import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

const sampleProducts = [
  { id: 1, name: 'Laptop', price: '$999', inStock: true },
  { id: 2, name: 'Phone', price: '$699', inStock: false },
  { id: 3, name: 'Tablet', price: '$499', inStock: true },
]

test('renders product dashboard title', () => {
  render(<App />)
  expect(screen.getByText(/Product Dashboard/i)).toBeInTheDocument()
})

test('displays all products initially', () => {
  render(<App />)

  sampleProducts.forEach((product) => {
    expect(screen.getByText(product.name)).toBeInTheDocument()
  })
})

test('applies conditional styling for out-of-stock products', () => {
  render(<App />)
  const outOfStockProduct = screen.getByText(/Phone/i) // Make sure "Phone" exists in sampleProducts
  expect(outOfStockProduct.closest('div')).toHaveClass('outOfStockClass')
})

test('removes product from the dashboard when "Remove" button is clicked', () => {
  render(<App />)
  const removeButtons = screen.queryAllByText(/Remove/i)

  expect(removeButtons.length).toBeGreaterThan(0) // Ensure buttons exist

  if (removeButtons.length > 0) {
    fireEvent.click(removeButtons[0])
    expect(removeButtons[0]).not.toBeInTheDocument() // Expect removal to work
  }
})

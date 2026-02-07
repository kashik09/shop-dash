import { Resend } from 'resend'

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY)

// Store email (from your verified domain or Resend's test domain)
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(order, customerEmail) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order Confirmed - #${order.id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${order.customerName},</p>
        <p>Your order <strong>#${order.id}</strong> has been confirmed.</p>
        
        <h2>Order Details</h2>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} x ${item.quantity} - UGX ${(item.price * item.quantity).toLocaleString()}</li>
          `).join('')}
        </ul>
        
        <p><strong>Subtotal:</strong> UGX ${order.subtotal.toLocaleString()}</p>
        <p><strong>Shipping:</strong> UGX ${order.shippingFee.toLocaleString()}</p>
        <p><strong>Total:</strong> UGX ${order.total.toLocaleString()}</p>
        
        <p><strong>Delivery to:</strong> ${order.location}</p>
        
        <p>We'll notify you when your order ships!</p>
        
        <p>Best regards,<br>ShopDash Team</p>
      `
    })

    if (error) {
      console.error('Email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Send email failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Send shipping update email
 */
export async function sendShippingUpdate(order, customerEmail, status) {
  try {
    const statusMessages = {
      shipped: 'Your order has been shipped!',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered!'
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order Update - #${order.id}`,
      html: `
        <h1>${statusMessages[status] || 'Order Update'}</h1>
        <p>Hi ${order.customerName},</p>
        <p>Your order <strong>#${order.id}</strong> status: <strong>${status.replace('_', ' ').toUpperCase()}</strong></p>
        <p>Best regards,<br>ShopDash Team</p>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Send low stock alert to admin
 */
export async function sendLowStockAlert(product, adminEmail) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `Low Stock Alert - ${product.name}`,
      html: `
        <h1>Low Stock Alert</h1>
        <p>Product <strong>${product.name}</strong> is running low on stock.</p>
        <p>Current stock: ${product.stock || 0}</p>
        <p>Please restock soon.</p>
      `
    })

    if (error) return { success: false, error }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

export default resend

import { readData, writeData, getNextId } from './db.js'
import { sendAdminAlert } from './resend.js'
import { isEmail } from './validation.js'

export const logAdminAlert = ({
  adminId,
  type,
  message,
  ip,
  userAgent,
  email,
  metadata = {},
}) => {
  const alerts = readData('admin-alerts') || []
  const record = {
    id: getNextId(alerts),
    adminId: adminId ?? null,
    type,
    message,
    metadata,
    ip: ip || null,
    userAgent: userAgent || null,
    createdAt: new Date().toISOString(),
  }

  alerts.push(record)
  writeData('admin-alerts', alerts)

  if (email && isEmail(email)) {
    sendAdminAlert(email, type, message)
  }

  return record
}

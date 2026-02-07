import { readData, writeData, getNextId } from './db.js'

export const logAudit = ({
  actorType,
  actorId,
  action,
  entity,
  entityId,
  metadata = {},
  ip,
  userAgent,
}) => {
  const audits = readData('audit') || []
  const record = {
    id: getNextId(audits),
    actorType,
    actorId,
    action,
    entity,
    entityId: entityId ?? null,
    metadata,
    ip: ip || null,
    userAgent: userAgent || null,
    createdAt: new Date().toISOString(),
  }

  audits.push(record)
  writeData('audit', audits)
  return record
}

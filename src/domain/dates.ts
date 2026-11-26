export const DAY_MS = 24 * 60 * 60 * 1000

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function addLocalDays(ts: number, days: number): number {
  const d = new Date(startOfLocalDay(ts))
  d.setDate(d.getDate() + days)
  return d.getTime()
}

export function formatRelativeDays(target: number | null, now: number): string {
  if (target == null) return 'Chưa lên lịch'
  if (target <= now) return 'Đến hạn'
  const days = Math.round((startOfLocalDay(target) - startOfLocalDay(now)) / DAY_MS)
  if (days <= 0) {
    const mins = Math.max(1, Math.round((target - now) / 60000))
    return mins < 60 ? `Sau ${mins} phút` : 'Hôm nay'
  }
  if (days === 1) return 'Ngày mai'
  return `Sau ${days} ngày`
}

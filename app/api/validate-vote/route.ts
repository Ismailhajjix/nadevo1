import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const VOTE_RECORDS = new Map<string, number>()
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours

export async function POST() {
  try {
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Check for VPN/Proxy (you might want to use a service like MaxMind)
    const isProxy = await checkIfProxy(ip)
    if (isProxy) {
      return NextResponse.json({
        success: false,
        message: 'التصويت غير مسموح به باستخدام VPN أو Proxy'
      })
    }

    // Check if IP has voted recently
    const lastVoteTime = VOTE_RECORDS.get(ip)
    if (lastVoteTime) {
      const timeSinceLastVote = Date.now() - lastVoteTime
      if (timeSinceLastVote < COOLDOWN_PERIOD) {
        const hoursRemaining = Math.ceil((COOLDOWN_PERIOD - timeSinceLastVote) / (1000 * 60 * 60))
        return NextResponse.json({
          success: false,
          message: `لقد قمت بالتصويت مسبقاً. يرجى المحاولة بعد ${hoursRemaining} ساعة`
        })
      }
    }

    // Record the vote
    VOTE_RECORDS.set(ip, Date.now())

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من التصويت'
    })
  }
}

async function checkIfProxy(ip: string): Promise<boolean> {
  // Implement proxy detection logic here
  // You might want to use a service like MaxMind or IPHub
  return false
} 
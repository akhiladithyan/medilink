import { RtcTokenBuilder, RtcRole } from 'agora-token'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channelName = searchParams.get('channelName')
  const uid = searchParams.get('uid') || 0
  const role = RtcRole.PUBLISHER

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE

  if (!appId || !appCertificate) {
    return NextResponse.json({ error: 'Agora credentials not set' }, { status: 500 })
  }

  if (!channelName) {
    return NextResponse.json({ error: 'channelName is required' }, { status: 400 })
  }

  const expirationTimeInSeconds = 3600
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    parseInt(uid),
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  )

  return NextResponse.json({ token })
}

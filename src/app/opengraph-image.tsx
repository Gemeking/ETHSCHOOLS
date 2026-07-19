import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'EthioSchools — Find Schools & Universities in Ethiopia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 55%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 84,
            fontWeight: 800,
          }}
        >
          🎓 EthioSchools
        </div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9, display: 'flex' }}>
          Find Schools &amp; Universities in Ethiopia
        </div>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 48,
            fontSize: 26,
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.14)', padding: '12px 28px', borderRadius: 999, display: 'flex' }}>
            400+ Schools
          </div>
          <div style={{ background: 'rgba(255,255,255,0.14)', padding: '12px 28px', borderRadius: 999, display: 'flex' }}>
            56 Universities
          </div>
          <div style={{ background: 'rgba(255,255,255,0.14)', padding: '12px 28px', borderRadius: 999, display: 'flex' }}>
            Fees &amp; Contacts
          </div>
        </div>
        <div style={{ fontSize: 24, marginTop: 48, opacity: 0.7, display: 'flex' }}>
          ethioschool.et
        </div>
      </div>
    ),
    size
  )
}

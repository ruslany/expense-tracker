import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Expense Tracker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4052FF 0%, #2a35b0 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            marginBottom: 32,
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          $
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16,
          }}
        >
          Expense Tracker
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          Personal expense tracking and management
        </div>
      </div>
    ),
    { ...size }
  );
}

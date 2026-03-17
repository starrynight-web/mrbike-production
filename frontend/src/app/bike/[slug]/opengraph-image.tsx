import { ImageResponse } from 'next/og';
import { apiServer } from '@/lib/api-server';

export const runtime = 'edge';

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const bike = await apiServer.getBike(slug);

  if (!bike) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          MrBikeBD - Bike Not Found
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const bikeName = bike.name;
  const brandName = bike.brand?.name || bike.brand_name || "";
  const price = bike.price ? `৳${bike.price.toLocaleString()}` : "Check Price";

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1a1a1a, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 40,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 24, color: '#facc15', marginBottom: 10, fontWeight: 'bold' }}>
            {brandName.toUpperCase()}
          </div>
          <div style={{ fontSize: 64, fontWeight: 'black', textAlign: 'center', marginBottom: 20 }}>
            {bikeName}
          </div>
          <div style={{ fontSize: 32, background: '#facc15', color: 'black', padding: '10px 30px', borderRadius: 10, fontWeight: 'bold' }}>
            {price}
          </div>
        </div>
        
        <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>
          mrbikebd.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

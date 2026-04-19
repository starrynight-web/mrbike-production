import { ImageResponse } from 'next/og';
import { apiServer } from '@/lib/api-server';

// Removed edge runtime to allow for static optimization during build

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const bike = await apiServer.getUsedBike(slug);

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
          MrBikeBD - Listing Not Found
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const title = `${bike.manufacturing_year || bike.year} ${bike.bike_model_name || bike.title}`;
  const price = `৳${bike.price.toLocaleString()}`;
  const location = bike.location || "Bangladesh";

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #1a1a1a, #333)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          color: 'white',
        }}
      >
        <div style={{ fontSize: 24, color: '#facc15', fontWeight: 'bold', marginBottom: 20 }}>
          USED BIKE FOR SALE
        </div>
        <div style={{ fontSize: 64, fontWeight: 'black', marginBottom: 20 }}>
          {title}
        </div>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#facc15', marginBottom: 20 }}>
          {price}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>
            📍 {location}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 32, fontWeight: 'bold' }}>
            MrBikeBD
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

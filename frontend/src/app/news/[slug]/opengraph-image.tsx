import { ImageResponse } from 'next/og';
import { apiServer } from '@/lib/api-server';

export const runtime = 'edge';

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const article = await apiServer.getArticle(slug);

  if (!article) {
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
          MrBikeBD - Article Not Found
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const title = article.title;
  const category = article.category || "News";

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          borderBottom: '20px solid #facc15',
        }}
      >
        <div style={{ fontSize: 24, color: '#facc15', fontWeight: 'bold', marginBottom: 20 }}>
          {category.toUpperCase()}
        </div>
        <div style={{ fontSize: 60, fontWeight: 'bold', color: '#1a1a1a', lineHeight: 1.2, marginBottom: 40 }}>
          {title}
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' }}>
            MrBikeBD
          </div>
          <div style={{ fontSize: 24, color: '#666' }}>
            mrbikebd.com
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

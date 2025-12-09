import { NextRequest, NextResponse } from 'next/server';

// Imagine.art API v2 endpoint
const IMAGINE_API_URL = 'https://api.vyro.ai/v2/image/generations';

// Valid style values for Imagine.art API v2 (string values, not IDs)
const VALID_STYLES = [
  'realistic', 'anime', 'disney', 'cartoon', 'digital', 'comic', 
  'fantasy', 'pixel', 'kawaii', 'painting', 'sketch', 'render_3d'
];

// Fallback: Use placeholder images for demo purposes
const PLACEHOLDER_BACKGROUNDS: Record<string, string> = {
  meadow: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1280&h=720&fit=crop',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280&h=720&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&h=720&fit=crop',
  night: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1280&h=720&fit=crop',
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop',
  park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1280&h=720&fit=crop',
  castle: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&h=720&fit=crop',
  space: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1280&h=720&fit=crop',
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.IMAGINE_API_KEY;

    const body = await request.json();
    const { prompt, style = 'cartoon', aspectRatio = '1:1', type = 'character' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhance prompt based on type
    let enhancedPrompt = prompt;
    if (type === 'character') {
      enhancedPrompt = `2D cartoon character, ${prompt}, full body, simple background, vibrant colors, suitable for animation, children's cartoon style`;
    } else if (type === 'background') {
      enhancedPrompt = `2D cartoon background scene, ${prompt}, vibrant colors, suitable for animation, children's cartoon style, no characters`;
    }

    // Use valid style or default to 'cartoon'
    const apiStyle = VALID_STYLES.includes(style.toLowerCase()) ? style.toLowerCase() : 'cartoon';

    // Try Imagine API if key is configured
    if (apiKey) {
      try {
        const formData = new FormData();
        formData.append('prompt', enhancedPrompt);
        formData.append('style', apiStyle); // Use 'style' not 'style_id'
        formData.append('aspect_ratio', aspectRatio);
        formData.append('seed', Math.floor(Math.random() * 1000).toString());

        console.log('Trying Imagine API...', { prompt: enhancedPrompt, style: apiStyle, aspectRatio });

        const response = await fetch(IMAGINE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('application/json')) {
            const jsonData = await response.json();
            console.log('Imagine API JSON response:', jsonData);
            if (jsonData.data?.[0]?.url) {
              return NextResponse.json({
                success: true,
                imageUrl: jsonData.data[0].url,
                prompt: enhancedPrompt,
                source: 'imagine-api',
              });
            } else if (jsonData.url) {
              return NextResponse.json({
                success: true,
                imageUrl: jsonData.url,
                prompt: enhancedPrompt,
                source: 'imagine-api',
              });
            }
          } else {
            // Binary image data
            const imageBuffer = await response.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`;

            return NextResponse.json({
              success: true,
              imageUrl: dataUrl,
              prompt: enhancedPrompt,
              source: 'imagine-api',
            });
          }
        } else {
          const errorText = await response.text();
          console.error('Imagine API error, falling back to placeholder:', errorText);
        }
      } catch (apiError) {
        console.error('Imagine API failed, using fallback:', apiError);
      }
    }

    // Fallback: Return a placeholder image based on prompt keywords
    if (type === 'background') {
      const promptLower = prompt.toLowerCase();
      let placeholderUrl = PLACEHOLDER_BACKGROUNDS.meadow;
      
      for (const [key, url] of Object.entries(PLACEHOLDER_BACKGROUNDS)) {
        if (promptLower.includes(key)) {
          placeholderUrl = url;
          break;
        }
      }

      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        prompt: enhancedPrompt,
        source: 'placeholder',
        note: 'Using placeholder image. Check Imagine.art API key configuration.',
      });
    }

    // For characters, return a message that AI generation isn't available
    return NextResponse.json({
      success: false,
      error: 'AI character generation temporarily unavailable. Using built-in character creator.',
      source: 'none',
    }, { status: 503 });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// GET endpoint to check API status
export async function GET() {
  const apiKey = process.env.IMAGINE_API_KEY;
  
  return NextResponse.json({
    available: !!apiKey,
    provider: 'imagine.art',
    styles: VALID_STYLES,
    note: apiKey ? 'API key configured' : 'Using placeholder images',
  });
}

/**
 * Props System for Cartoon Studio
 * Allows characters to hold and interact with objects
 */

export interface Prop {
  id: string;
  name: string;
  category: 'toy' | 'food' | 'tool' | 'nature' | 'book' | 'accessory' | 'furniture';
  width: number;
  height: number;
  attachPoint: 'leftHand' | 'rightHand' | 'head' | 'body' | 'ground';
  offsetX: number;
  offsetY: number;
  rotation: number;
  svg: string;
}

// Pre-defined props
export const PROPS: Prop[] = [
  // Toys
  {
    id: 'ball',
    name: 'Ball',
    category: 'toy',
    width: 30,
    height: 30,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: 5,
    rotation: 0,
    svg: `<circle cx="15" cy="15" r="14" fill="#E74C3C" stroke="#C0392B" stroke-width="2"/>
          <path d="M8 8 Q15 5 22 8" stroke="white" stroke-width="2" fill="none" opacity="0.5"/>
          <ellipse cx="10" cy="10" rx="3" ry="2" fill="white" opacity="0.3"/>`,
  },
  {
    id: 'teddy',
    name: 'Teddy Bear',
    category: 'toy',
    width: 40,
    height: 50,
    attachPoint: 'rightHand',
    offsetX: 5,
    offsetY: 0,
    rotation: -15,
    svg: `<ellipse cx="20" cy="35" rx="15" ry="18" fill="#D2691E"/>
          <circle cx="20" cy="15" r="12" fill="#D2691E"/>
          <circle cx="10" cy="8" r="5" fill="#D2691E"/>
          <circle cx="30" cy="8" r="5" fill="#D2691E"/>
          <circle cx="10" cy="8" r="3" fill="#F4A460"/>
          <circle cx="30" cy="8" r="3" fill="#F4A460"/>
          <ellipse cx="20" cy="32" rx="10" ry="12" fill="#F4A460"/>
          <circle cx="15" cy="13" r="2" fill="#333"/>
          <circle cx="25" cy="13" r="2" fill="#333"/>
          <ellipse cx="20" cy="18" rx="3" ry="2" fill="#333"/>
          <path d="M17 20 Q20 23 23 20" stroke="#333" stroke-width="1" fill="none"/>`,
  },
  {
    id: 'balloon',
    name: 'Balloon',
    category: 'toy',
    width: 35,
    height: 60,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: -50,
    rotation: 0,
    svg: `<ellipse cx="17" cy="20" rx="15" ry="18" fill="#E74C3C"/>
          <polygon points="17,38 14,42 20,42" fill="#E74C3C"/>
          <path d="M17 42 Q15 50 17 60" stroke="#888" stroke-width="1" fill="none"/>
          <ellipse cx="12" cy="15" rx="4" ry="3" fill="white" opacity="0.3"/>`,
  },
  
  // Food
  {
    id: 'apple',
    name: 'Apple',
    category: 'food',
    width: 25,
    height: 28,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: 5,
    rotation: 0,
    svg: `<circle cx="12" cy="16" r="11" fill="#E74C3C"/>
          <ellipse cx="8" cy="12" rx="3" ry="2" fill="#FF6B6B" opacity="0.5"/>
          <path d="M12 5 Q14 2 16 5" stroke="#8B4513" stroke-width="2" fill="none"/>
          <ellipse cx="14" cy="4" rx="4" ry="2" fill="#27AE60" transform="rotate(30 14 4)"/>`,
  },
  {
    id: 'icecream',
    name: 'Ice Cream',
    category: 'food',
    width: 25,
    height: 45,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    svg: `<polygon points="12,45 0,20 24,20" fill="#DEB887"/>
          <circle cx="12" cy="15" r="10" fill="#FFB6C1"/>
          <circle cx="12" cy="5" r="8" fill="#87CEEB"/>
          <circle cx="12" cy="12" r="2" fill="#8B4513"/>
          <circle cx="8" cy="8" r="1.5" fill="#8B4513"/>
          <circle cx="16" cy="10" r="1.5" fill="#8B4513"/>`,
  },
  {
    id: 'cookie',
    name: 'Cookie',
    category: 'food',
    width: 28,
    height: 28,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: 5,
    rotation: 0,
    svg: `<circle cx="14" cy="14" r="13" fill="#D2691E"/>
          <circle cx="8" cy="10" r="2" fill="#5D4037"/>
          <circle cx="16" cy="8" r="2" fill="#5D4037"/>
          <circle cx="12" cy="16" r="2" fill="#5D4037"/>
          <circle cx="18" cy="15" r="2" fill="#5D4037"/>
          <circle cx="6" cy="17" r="1.5" fill="#5D4037"/>`,
  },
  
  // Nature
  {
    id: 'flower',
    name: 'Flower',
    category: 'nature',
    width: 30,
    height: 50,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: -10,
    rotation: 0,
    svg: `<path d="M15 50 L15 25" stroke="#228B22" stroke-width="3"/>
          <ellipse cx="10" cy="35" rx="5" ry="3" fill="#32CD32" transform="rotate(-30 10 35)"/>
          <ellipse cx="20" cy="40" rx="5" ry="3" fill="#32CD32" transform="rotate(30 20 40)"/>
          <circle cx="15" cy="15" r="6" fill="#FFD700"/>
          <ellipse cx="15" cy="5" rx="5" ry="7" fill="#FF69B4"/>
          <ellipse cx="7" cy="12" rx="5" ry="7" fill="#FF69B4" transform="rotate(-60 7 12)"/>
          <ellipse cx="23" cy="12" rx="5" ry="7" fill="#FF69B4" transform="rotate(60 23 12)"/>
          <ellipse cx="9" cy="22" rx="5" ry="7" fill="#FF69B4" transform="rotate(-120 9 22)"/>
          <ellipse cx="21" cy="22" rx="5" ry="7" fill="#FF69B4" transform="rotate(120 21 22)"/>`,
  },
  {
    id: 'butterfly-net',
    name: 'Butterfly Net',
    category: 'nature',
    width: 40,
    height: 70,
    attachPoint: 'rightHand',
    offsetX: 10,
    offsetY: -30,
    rotation: -30,
    svg: `<line x1="5" y1="70" x2="25" y2="25" stroke="#8B4513" stroke-width="4"/>
          <circle cx="25" cy="20" r="15" fill="none" stroke="#8B4513" stroke-width="3"/>
          <path d="M10 20 Q25 40 40 20" stroke="#DDD" stroke-width="1" fill="rgba(255,255,255,0.3)"/>
          <path d="M15 25 Q25 45 35 25" stroke="#DDD" stroke-width="1" fill="none"/>`,
  },
  
  // Books
  {
    id: 'book',
    name: 'Book',
    category: 'book',
    width: 35,
    height: 45,
    attachPoint: 'rightHand',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    svg: `<rect x="2" y="2" width="30" height="40" rx="2" fill="#E74C3C"/>
          <rect x="5" y="5" width="24" height="34" fill="#FFF"/>
          <line x1="17" y1="5" x2="17" y2="39" stroke="#E74C3C" stroke-width="2"/>
          <rect x="8" y="10" width="6" height="2" fill="#333"/>
          <rect x="8" y="15" width="6" height="1" fill="#999"/>
          <rect x="8" y="18" width="6" height="1" fill="#999"/>
          <rect x="20" y="10" width="6" height="2" fill="#333"/>
          <rect x="20" y="15" width="6" height="1" fill="#999"/>
          <rect x="20" y="18" width="6" height="1" fill="#999"/>`,
  },
  
  // Accessories
  {
    id: 'hat',
    name: 'Party Hat',
    category: 'accessory',
    width: 40,
    height: 50,
    attachPoint: 'head',
    offsetX: 0,
    offsetY: -40,
    rotation: 0,
    svg: `<polygon points="20,0 0,45 40,45" fill="#9B59B6"/>
          <circle cx="20" cy="3" r="5" fill="#F1C40F"/>
          <rect x="0" y="42" width="40" height="5" fill="#E74C3C"/>
          <circle cx="10" cy="20" r="3" fill="#3498DB"/>
          <circle cx="25" cy="30" r="3" fill="#2ECC71"/>
          <circle cx="15" cy="35" r="2" fill="#F39C12"/>`,
  },
  {
    id: 'crown',
    name: 'Crown',
    category: 'accessory',
    width: 45,
    height: 30,
    attachPoint: 'head',
    offsetX: 0,
    offsetY: -25,
    rotation: 0,
    svg: `<path d="M0,30 L5,10 L12,20 L22,0 L32,20 L39,10 L44,30 Z" fill="#F1C40F"/>
          <rect x="0" y="25" width="44" height="5" fill="#F39C12"/>
          <circle cx="22" cy="8" r="4" fill="#E74C3C"/>
          <circle cx="10" cy="15" r="3" fill="#3498DB"/>
          <circle cx="34" cy="15" r="3" fill="#2ECC71"/>`,
  },
  {
    id: 'glasses',
    name: 'Glasses',
    category: 'accessory',
    width: 50,
    height: 20,
    attachPoint: 'head',
    offsetX: 0,
    offsetY: 5,
    rotation: 0,
    svg: `<circle cx="12" cy="10" r="10" fill="none" stroke="#333" stroke-width="2"/>
          <circle cx="38" cy="10" r="10" fill="none" stroke="#333" stroke-width="2"/>
          <line x1="22" y1="10" x2="28" y2="10" stroke="#333" stroke-width="2"/>
          <line x1="2" y1="10" x2="0" y2="8" stroke="#333" stroke-width="2"/>
          <line x1="48" y1="10" x2="50" y2="8" stroke="#333" stroke-width="2"/>
          <ellipse cx="12" cy="10" rx="8" ry="8" fill="rgba(100,149,237,0.3)"/>
          <ellipse cx="38" cy="10" rx="8" ry="8" fill="rgba(100,149,237,0.3)"/>`,
  },
  
  // Furniture/Ground items
  {
    id: 'bench',
    name: 'Park Bench',
    category: 'furniture',
    width: 100,
    height: 50,
    attachPoint: 'ground',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    svg: `<rect x="5" y="20" width="90" height="8" rx="2" fill="#8B4513"/>
          <rect x="5" y="30" width="90" height="5" rx="1" fill="#A0522D"/>
          <rect x="10" y="35" width="8" height="15" fill="#5D4037"/>
          <rect x="82" y="35" width="8" height="15" fill="#5D4037"/>
          <rect x="5" y="10" width="90" height="5" rx="1" fill="#A0522D"/>`,
  },
  {
    id: 'tree',
    name: 'Tree',
    category: 'furniture',
    width: 80,
    height: 120,
    attachPoint: 'ground',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    svg: `<rect x="35" y="70" width="10" height="50" fill="#8B4513"/>
          <ellipse cx="40" cy="45" rx="35" ry="40" fill="#228B22"/>
          <ellipse cx="25" cy="35" rx="20" ry="25" fill="#2ECC71"/>
          <ellipse cx="55" cy="35" rx="20" ry="25" fill="#2ECC71"/>
          <ellipse cx="40" cy="20" rx="15" ry="20" fill="#27AE60"/>`,
  },
];

// Get prop by ID
export function getProp(id: string): Prop | undefined {
  return PROPS.find(p => p.id === id);
}

// Get props by category
export function getPropsByCategory(category: Prop['category']): Prop[] {
  return PROPS.filter(p => p.category === category);
}

// Render prop as SVG string
export function renderPropSVG(prop: Prop): string {
  return `<svg width="${prop.width}" height="${prop.height}" viewBox="0 0 ${prop.width} ${prop.height}">${prop.svg}</svg>`;
}

// Get all prop categories
export function getPropCategories(): Prop['category'][] {
  return ['toy', 'food', 'tool', 'nature', 'book', 'accessory', 'furniture'];
}

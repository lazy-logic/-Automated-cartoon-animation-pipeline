/**
 * Custom Character Creator
 * Color picker, accessories, and save custom characters
 */

export interface CharacterColors {
  skin: string;
  hair: string;
  eyes: string;
  primary: string;   // Main clothing color
  secondary: string; // Accent color
  shoes: string;
}

export interface CharacterAccessory {
  id: string;
  name: string;
  category: 'hat' | 'glasses' | 'necklace' | 'earrings' | 'backpack' | 'wings' | 'cape';
  svg: string;
  attachPoint: { x: number; y: number };
  scale: number;
}

export interface CharacterHairstyle {
  id: string;
  name: string;
  svg: string;
  colorizable: boolean;
}

export interface CharacterOutfit {
  id: string;
  name: string;
  category: 'casual' | 'formal' | 'sports' | 'fantasy' | 'pajamas';
  topSvg: string;
  bottomSvg: string;
  colorizable: boolean;
}

export interface CustomCharacter {
  id: string;
  name: string;
  baseType: 'child' | 'adult' | 'animal';
  gender: 'male' | 'female' | 'neutral';
  colors: CharacterColors;
  hairstyle: string;
  outfit: string;
  accessories: string[];
  createdAt: number;
  updatedAt: number;
}

// Default color palettes
export const SKIN_TONES = [
  '#FFDFC4', '#F0D5BE', '#EECEB3', '#E1B899', '#D4A574',
  '#C68642', '#8D5524', '#6B4423', '#4A3728', '#3B2F2E',
];

export const HAIR_COLORS = [
  '#090806', '#2C222B', '#3B3024', '#4E433F', '#504444',
  '#6A4E42', '#A7856A', '#B89778', '#DCD0BA', '#E5C8A8',
  '#DEBC99', '#B55239', '#8D4A43', '#91553D', '#533D32',
  '#71635A', '#B7A69E', '#D6C4C2', '#CABFB1', '#DCD0BA',
  '#977961', '#E6CEA8', '#E5C8A8', '#A56B46', '#B55239',
  '#8D4A43', '#91553D', '#533D32', '#3B3024', '#554838',
];

export const EYE_COLORS = [
  '#634E34', '#2E536F', '#3D671D', '#497665', '#7B3F00',
  '#1C7847', '#01796F', '#0D98BA', '#6699CC', '#8B4513',
];

export const CLOTHING_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E91E63', '#00BCD4', '#8BC34A', '#FF9800',
  '#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242',
  '#212121', '#000000',
];

// Hairstyles
export const HAIRSTYLES: CharacterHairstyle[] = [
  {
    id: 'short',
    name: 'Short',
    colorizable: true,
    svg: `<ellipse cx="50" cy="25" rx="35" ry="20" fill="currentColor"/>
          <path d="M20 30 Q50 10 80 30" fill="currentColor"/>`,
  },
  {
    id: 'medium',
    name: 'Medium',
    colorizable: true,
    svg: `<ellipse cx="50" cy="25" rx="38" ry="22" fill="currentColor"/>
          <path d="M15 35 Q15 60 25 75" stroke="currentColor" stroke-width="8" fill="none"/>
          <path d="M85 35 Q85 60 75 75" stroke="currentColor" stroke-width="8" fill="none"/>`,
  },
  {
    id: 'long',
    name: 'Long',
    colorizable: true,
    svg: `<ellipse cx="50" cy="25" rx="40" ry="25" fill="currentColor"/>
          <path d="M12 35 Q10 80 20 110" stroke="currentColor" stroke-width="10" fill="none"/>
          <path d="M88 35 Q90 80 80 110" stroke="currentColor" stroke-width="10" fill="none"/>`,
  },
  {
    id: 'curly',
    name: 'Curly',
    colorizable: true,
    svg: `<circle cx="30" cy="20" r="12" fill="currentColor"/>
          <circle cx="50" cy="15" r="14" fill="currentColor"/>
          <circle cx="70" cy="20" r="12" fill="currentColor"/>
          <circle cx="20" cy="35" r="10" fill="currentColor"/>
          <circle cx="80" cy="35" r="10" fill="currentColor"/>`,
  },
  {
    id: 'ponytail',
    name: 'Ponytail',
    colorizable: true,
    svg: `<ellipse cx="50" cy="25" rx="35" ry="20" fill="currentColor"/>
          <ellipse cx="75" cy="50" rx="15" ry="35" fill="currentColor"/>`,
  },
  {
    id: 'pigtails',
    name: 'Pigtails',
    colorizable: true,
    svg: `<ellipse cx="50" cy="25" rx="35" ry="20" fill="currentColor"/>
          <ellipse cx="20" cy="55" rx="12" ry="30" fill="currentColor"/>
          <ellipse cx="80" cy="55" rx="12" ry="30" fill="currentColor"/>`,
  },
  {
    id: 'spiky',
    name: 'Spiky',
    colorizable: true,
    svg: `<polygon points="50,5 55,25 65,8 60,25 75,15 65,28 80,25 65,35 50,25 35,35 20,25 35,28 25,15 40,25 35,8 45,25" fill="currentColor"/>`,
  },
  {
    id: 'bald',
    name: 'Bald',
    colorizable: false,
    svg: ``,
  },
];

// Accessories
export const ACCESSORIES: CharacterAccessory[] = [
  {
    id: 'cap',
    name: 'Baseball Cap',
    category: 'hat',
    attachPoint: { x: 50, y: 10 },
    scale: 1,
    svg: `<ellipse cx="50" cy="15" rx="35" ry="12" fill="#E74C3C"/>
          <rect x="15" y="12" width="70" height="8" rx="2" fill="#C0392B"/>
          <ellipse cx="50" cy="20" rx="40" ry="5" fill="#C0392B"/>`,
  },
  {
    id: 'crown',
    name: 'Crown',
    category: 'hat',
    attachPoint: { x: 50, y: 5 },
    scale: 1,
    svg: `<path d="M20 25 L30 10 L40 20 L50 5 L60 20 L70 10 L80 25 L75 30 L25 30 Z" fill="#F1C40F" stroke="#D4AC0D" stroke-width="2"/>
          <circle cx="50" cy="12" r="4" fill="#E74C3C"/>
          <circle cx="35" cy="18" r="3" fill="#3498DB"/>
          <circle cx="65" cy="18" r="3" fill="#3498DB"/>`,
  },
  {
    id: 'wizard-hat',
    name: 'Wizard Hat',
    category: 'hat',
    attachPoint: { x: 50, y: 0 },
    scale: 1.2,
    svg: `<path d="M50 0 L80 40 L20 40 Z" fill="#9B59B6"/>
          <ellipse cx="50" cy="40" rx="35" ry="8" fill="#8E44AD"/>
          <circle cx="45" cy="20" r="3" fill="#F1C40F"/>
          <circle cx="55" cy="30" r="2" fill="#F1C40F"/>`,
  },
  {
    id: 'glasses',
    name: 'Glasses',
    category: 'glasses',
    attachPoint: { x: 50, y: 45 },
    scale: 0.8,
    svg: `<circle cx="35" cy="50" r="12" fill="none" stroke="#333" stroke-width="3"/>
          <circle cx="65" cy="50" r="12" fill="none" stroke="#333" stroke-width="3"/>
          <line x1="47" y1="50" x2="53" y2="50" stroke="#333" stroke-width="3"/>
          <line x1="23" y1="50" x2="15" y2="45" stroke="#333" stroke-width="2"/>
          <line x1="77" y1="50" x2="85" y2="45" stroke="#333" stroke-width="2"/>`,
  },
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    category: 'glasses',
    attachPoint: { x: 50, y: 45 },
    scale: 0.8,
    svg: `<rect x="22" y="42" width="26" height="16" rx="3" fill="#1a1a1a"/>
          <rect x="52" y="42" width="26" height="16" rx="3" fill="#1a1a1a"/>
          <line x1="48" y1="50" x2="52" y2="50" stroke="#333" stroke-width="3"/>
          <line x1="22" y1="50" x2="12" y2="45" stroke="#333" stroke-width="2"/>
          <line x1="78" y1="50" x2="88" y2="45" stroke="#333" stroke-width="2"/>`,
  },
  {
    id: 'backpack',
    name: 'Backpack',
    category: 'backpack',
    attachPoint: { x: 50, y: 80 },
    scale: 0.6,
    svg: `<rect x="30" y="60" width="40" height="50" rx="5" fill="#E74C3C"/>
          <rect x="35" y="65" width="30" height="20" rx="3" fill="#C0392B"/>
          <rect x="40" y="90" width="20" height="15" rx="2" fill="#C0392B"/>`,
  },
  {
    id: 'wings',
    name: 'Fairy Wings',
    category: 'wings',
    attachPoint: { x: 50, y: 70 },
    scale: 1.5,
    svg: `<ellipse cx="25" cy="70" rx="20" ry="35" fill="rgba(135, 206, 250, 0.6)" stroke="#87CEEB" stroke-width="2"/>
          <ellipse cx="75" cy="70" rx="20" ry="35" fill="rgba(135, 206, 250, 0.6)" stroke="#87CEEB" stroke-width="2"/>
          <ellipse cx="30" cy="75" rx="10" ry="20" fill="rgba(255, 182, 193, 0.4)"/>
          <ellipse cx="70" cy="75" rx="10" ry="20" fill="rgba(255, 182, 193, 0.4)"/>`,
  },
  {
    id: 'cape',
    name: 'Superhero Cape',
    category: 'cape',
    attachPoint: { x: 50, y: 60 },
    scale: 1.2,
    svg: `<path d="M30 55 Q25 100 35 130 L50 125 L65 130 Q75 100 70 55" fill="#E74C3C"/>
          <path d="M32 58 Q28 95 38 120 L50 116 L62 120 Q72 95 68 58" fill="#C0392B"/>`,
  },
  {
    id: 'bow',
    name: 'Hair Bow',
    category: 'hat',
    attachPoint: { x: 70, y: 20 },
    scale: 0.6,
    svg: `<path d="M50 50 Q30 35 35 50 Q30 65 50 50" fill="#FF69B4"/>
          <path d="M50 50 Q70 35 65 50 Q70 65 50 50" fill="#FF69B4"/>
          <circle cx="50" cy="50" r="5" fill="#FF1493"/>`,
  },
];

// Outfits
export const OUTFITS: CharacterOutfit[] = [
  {
    id: 'casual-tshirt',
    name: 'Casual T-Shirt',
    category: 'casual',
    colorizable: true,
    topSvg: `<path d="M30 60 L25 55 L15 65 L25 75 L30 70 L30 100 L70 100 L70 70 L75 75 L85 65 L75 55 L70 60 L70 55 Q50 45 30 55 Z" fill="currentColor"/>`,
    bottomSvg: `<rect x="32" y="100" width="15" height="40" rx="3" fill="#3498DB"/>
                <rect x="53" y="100" width="15" height="40" rx="3" fill="#3498DB"/>`,
  },
  {
    id: 'dress',
    name: 'Dress',
    category: 'casual',
    colorizable: true,
    topSvg: `<path d="M35 55 Q50 45 65 55 L70 60 L75 55 L85 65 L75 75 L70 70 L75 130 L25 130 L30 70 L25 75 L15 65 L25 55 L30 60 Z" fill="currentColor"/>`,
    bottomSvg: ``,
  },
  {
    id: 'sports',
    name: 'Sports Jersey',
    category: 'sports',
    colorizable: true,
    topSvg: `<path d="M30 60 L20 55 L10 70 L20 80 L30 75 L30 100 L70 100 L70 75 L80 80 L90 70 L80 55 L70 60 L70 55 Q50 45 30 55 Z" fill="currentColor"/>
             <text x="50" y="85" text-anchor="middle" fill="white" font-size="20" font-weight="bold">7</text>`,
    bottomSvg: `<rect x="30" y="100" width="18" height="35" rx="3" fill="currentColor"/>
                <rect x="52" y="100" width="18" height="35" rx="3" fill="currentColor"/>`,
  },
  {
    id: 'princess',
    name: 'Princess Gown',
    category: 'fantasy',
    colorizable: true,
    topSvg: `<path d="M35 55 Q50 45 65 55 L68 60 L72 55 L80 62 L72 70 L68 65 L70 75 L85 140 L15 140 L30 75 L32 65 L28 70 L20 62 L28 55 L32 60 Z" fill="currentColor"/>
             <ellipse cx="50" cy="58" rx="8" ry="4" fill="rgba(255,255,255,0.3)"/>`,
    bottomSvg: ``,
  },
  {
    id: 'pajamas',
    name: 'Pajamas',
    category: 'pajamas',
    colorizable: true,
    topSvg: `<path d="M32 55 Q50 48 68 55 L68 100 L32 100 Z" fill="currentColor"/>
             <circle cx="50" cy="65" r="3" fill="white"/>
             <circle cx="50" cy="78" r="3" fill="white"/>
             <circle cx="50" cy="91" r="3" fill="white"/>`,
    bottomSvg: `<rect x="32" y="100" width="16" height="40" rx="5" fill="currentColor"/>
                <rect x="52" y="100" width="16" height="40" rx="5" fill="currentColor"/>`,
  },
];

/**
 * Character Creator Manager
 */
export class CharacterCreator {
  private characters: Map<string, CustomCharacter> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Create a new custom character
   */
  createCharacter(
    name: string,
    baseType: CustomCharacter['baseType'] = 'child',
    gender: CustomCharacter['gender'] = 'neutral'
  ): CustomCharacter {
    const character: CustomCharacter = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      baseType,
      gender,
      colors: {
        skin: SKIN_TONES[2],
        hair: HAIR_COLORS[0],
        eyes: EYE_COLORS[0],
        primary: CLOTHING_COLORS[0],
        secondary: CLOTHING_COLORS[4],
        shoes: '#333333',
      },
      hairstyle: 'medium',
      outfit: 'casual-tshirt',
      accessories: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.characters.set(character.id, character);
    this.saveToStorage();
    return character;
  }

  /**
   * Update character colors
   */
  updateColors(characterId: string, colors: Partial<CharacterColors>): CustomCharacter | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    character.colors = { ...character.colors, ...colors };
    character.updatedAt = Date.now();
    this.saveToStorage();
    return character;
  }

  /**
   * Update character hairstyle
   */
  updateHairstyle(characterId: string, hairstyleId: string): CustomCharacter | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    character.hairstyle = hairstyleId;
    character.updatedAt = Date.now();
    this.saveToStorage();
    return character;
  }

  /**
   * Update character outfit
   */
  updateOutfit(characterId: string, outfitId: string): CustomCharacter | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    character.outfit = outfitId;
    character.updatedAt = Date.now();
    this.saveToStorage();
    return character;
  }

  /**
   * Add accessory to character
   */
  addAccessory(characterId: string, accessoryId: string): CustomCharacter | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    if (!character.accessories.includes(accessoryId)) {
      character.accessories.push(accessoryId);
      character.updatedAt = Date.now();
      this.saveToStorage();
    }
    return character;
  }

  /**
   * Remove accessory from character
   */
  removeAccessory(characterId: string, accessoryId: string): CustomCharacter | null {
    const character = this.characters.get(characterId);
    if (!character) return null;

    character.accessories = character.accessories.filter(a => a !== accessoryId);
    character.updatedAt = Date.now();
    this.saveToStorage();
    return character;
  }

  /**
   * Get character by ID
   */
  getCharacter(characterId: string): CustomCharacter | null {
    return this.characters.get(characterId) || null;
  }

  /**
   * Get all custom characters
   */
  getAllCharacters(): CustomCharacter[] {
    return Array.from(this.characters.values());
  }

  /**
   * Delete character
   */
  deleteCharacter(characterId: string): boolean {
    const deleted = this.characters.delete(characterId);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  /**
   * Duplicate character
   */
  duplicateCharacter(characterId: string, newName?: string): CustomCharacter | null {
    const original = this.characters.get(characterId);
    if (!original) return null;

    const duplicate: CustomCharacter = {
      ...JSON.parse(JSON.stringify(original)),
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.characters.set(duplicate.id, duplicate);
    this.saveToStorage();
    return duplicate;
  }

  /**
   * Export character as JSON
   */
  exportCharacter(characterId: string): string | null {
    const character = this.characters.get(characterId);
    if (!character) return null;
    return JSON.stringify(character, null, 2);
  }

  /**
   * Import character from JSON
   */
  importCharacter(json: string): CustomCharacter | null {
    try {
      const character = JSON.parse(json) as CustomCharacter;
      character.id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      character.createdAt = Date.now();
      character.updatedAt = Date.now();
      this.characters.set(character.id, character);
      this.saveToStorage();
      return character;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    const data = JSON.stringify(Array.from(this.characters.entries()));
    localStorage.setItem('custom-characters', data);
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem('custom-characters');
    if (data) {
      try {
        const entries = JSON.parse(data) as [string, CustomCharacter][];
        this.characters = new Map(entries);
      } catch {
        // Invalid data, start fresh
      }
    }
  }
}

// Singleton
let characterCreator: CharacterCreator | null = null;

export function getCharacterCreator(): CharacterCreator {
  if (!characterCreator) {
    characterCreator = new CharacterCreator();
  }
  return characterCreator;
}

export const FONT_OPTIONS = [
  'Playfair Display — serif clássico editorial',
  'Cormorant Garamond — serif elegante e refinado',
  'Bodoni Moda — serif alta costura e moda',
  'Cinzel — serif esculpido e monumental',
  'Lora — serif literário e quente',
  'Prata — serif poético e gracioso',
  'Plus Jakarta Sans — sans-serif limpo moderno',
  'Syne — sans-serif contemporâneo e vanguardista',
  'Tenor Sans — sans-serif com espaçamento nobre',
  'Montserrat — sans-serif geométrico de prestígio',
  'Jost — sans-serif minimalista estilo Bauhaus',
  'Inter — sans-serif neutro e legível',
  'Helvetica Neue — sans-serif intemporal',
  'Neue Haas Grotesk — sans-serif modernista',
  'Avenir — sans-serif limpo',
  'Manrope — sans-serif geométrico e moderno',
  'Satoshi — sans-serif neo-grotesco'
];

export function getFontFamily(fontName?: string): string {
  if (!fontName) return '"Playfair Display", Georgia, serif';
  if (fontName.includes('Cormorant Garamond')) return '"Cormorant Garamond", Georgia, serif';
  if (fontName.includes('Bodoni Moda')) return '"Bodoni Moda", Georgia, serif';
  if (fontName.includes('Cinzel')) return '"Cinzel", serif';
  if (fontName.includes('Lora')) return '"Lora", Georgia, serif';
  if (fontName.includes('Prata')) return '"Prata", serif';
  if (fontName.includes('Plus Jakarta Sans')) return '"Plus Jakarta Sans", sans-serif';
  if (fontName.includes('Syne')) return '"Syne", sans-serif';
  if (fontName.includes('Tenor Sans')) return '"Tenor Sans", sans-serif';
  if (fontName.includes('Montserrat')) return '"Montserrat", sans-serif';
  if (fontName.includes('Jost')) return '"Jost", sans-serif';
  if (fontName.includes('Inter')) return 'Inter, system-ui, sans-serif';
  if (fontName.includes('Helvetica Neue')) return '"Helvetica Neue", Helvetica, Arial, sans-serif';
  if (fontName.includes('Neue Haas Grotesk')) return '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Text Pro", Helvetica, Arial, sans-serif';
  if (fontName.includes('Avenir')) return '"Avenir Next", Avenir, sans-serif';
  if (fontName.includes('Manrope')) return '"Manrope", sans-serif';
  if (fontName.includes('Satoshi')) return '"Satoshi", sans-serif';
  if (fontName.includes('Playfair Display')) return '"Playfair Display", Georgia, serif';
  return fontName;
}

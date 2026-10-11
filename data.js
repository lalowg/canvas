// CANVAS — exhibition data. All artists and works are fictional.

export const ARTISTS = [
  { id: 'marrow', name: 'Ilse Marrow', born: 1988, base: 'Rotterdam', practice: 'Wind data, plotters, ink', bio: 'Ilse Marrow records wind on the roofs of Rotterdam and turns a season of gusts into a single drawing. Her fields are made of thousands of short strokes, each one nudged by the air that passed through the city on a given night.' },
  { id: 'brandt', name: 'Aiko Brandt', born: 1990, base: 'Osaka and Berlin', practice: 'Line, weaving, topography', bio: 'Aiko Brandt trained as a textile designer before she wrote her first line of code. She still thinks in warp and weft: every image is a set of threads pulled slightly out of true.' },
  { id: 'adjei', name: 'Kofi Adjei-Lund', born: 1991, base: 'Accra and Copenhagen', practice: 'Tiles, pattern, repetition', bio: 'Kofi Adjei-Lund builds large images from one small tile turned four ways. His work borrows from kente strip weaving and Danish tiled stoves in equal measure.' },
  { id: 'sorli', name: 'Hanne Sørli', born: 1995, base: 'Bergen', practice: 'Geometric composition systems', bio: 'Hanne Sørli writes rules instead of drawing pictures. Her composition machines place circles, halves and bars on a grid, then argue with themselves until the balance feels right.' },
  { id: 'valdes', name: 'Teo Valdés Ruiz', born: 1979, base: 'Valparaíso', practice: 'Orbits, rotation, slow motion', bio: 'Teo Valdés Ruiz spent ten years photographing the night sky over the Atacama. His generative pieces keep the patience of long exposures: nothing in them is ever completely still.' },
  { id: 'okonkwo', name: 'Mira Okonkwo-Hale', born: 1984, base: 'Lagos and Bristol', practice: 'Landscape from noise', bio: 'Mira Okonkwo-Hale paints landscapes that never existed, grown from mathematical noise and tuned until they feel remembered rather than invented.' },
  { id: 'haddad', name: 'Samir Haddad', born: 1986, base: 'Beirut and Marseille', practice: 'Networks, presence, interaction', bio: 'Samir Haddad makes work that needs a visitor to finish it. His networks are incomplete until someone stands in front of them and becomes one more point of connection.' }
];

export const WORKS = [
  { id: 'w01', no: '01', title: 'Field Notes on Wind', artist: 'marrow', year: 2026, room: 1, algo: 'flow', palette: 'gallery', aspect: 0.8, seed: 3141, params: { density: 0.55, chaos: 0.45 }, text: 'Twelve thousand strokes, each bent by a noise field tuned to one stormy night. Click to let a different night pass through.' },
  { id: 'w02', no: '02', title: 'Thread Count', artist: 'brandt', year: 2025, room: 1, algo: 'threads', palette: 'paper', aspect: 0.75, seed: 808, params: { density: 0.6, chaos: 0.4 }, text: 'Vertical threads pulled gently off the straight by an invisible hand. Two coloured bands repeat like a pattern that forgot its rule.' },
  { id: 'w03', no: '03', title: 'Contour for a Quiet Hill', artist: 'brandt', year: 2026, room: 1, algo: 'contour', palette: 'gallery', aspect: 1.25, seed: 77, params: { density: 0.5, chaos: 0.5 }, text: 'A hill that exists only as its contour lines. One line is drawn in red: the height at which the artist imagines standing.' },
  { id: 'w04', no: '04', title: 'Tessellated Sun', artist: 'adjei', year: 2026, room: 2, algo: 'truchet', palette: 'ochre', aspect: 1, seed: 1957, params: { density: 0.45, chaos: 0.5 }, text: 'One tile, a quarter circle, turned at random across the grid. Paths appear that nobody drew.' },
  { id: 'w05', no: '05', title: 'Composition Machine No. 7', artist: 'sorli', year: 2025, room: 2, algo: 'bauhaus', palette: 'gallery', aspect: 0.8, seed: 7, params: { density: 0.5, chaos: 0.55 }, text: 'Seventh version of a machine that composes with circles, halves and bars. Every click asks it to start the argument again.' },
  { id: 'w06', no: '06', title: 'Orbitals', artist: 'valdes', year: 2026, room: 3, algo: 'orbitals', palette: 'ink', aspect: 1, seed: 1969, params: { density: 0.6, chaos: 0.4 }, text: 'Broken rings turning at different speeds, like a long exposure that never ends. Move closer: the outer rings respond to you.' },
  { id: 'w07', no: '07', title: 'Bloom, Slowly', artist: 'valdes', year: 2024, room: 3, algo: 'bloom', palette: 'ink', aspect: 0.8, seed: 24, params: { density: 0.5, chaos: 0.35 }, text: 'Rose curves layered until they behave like petals. The flower is a single equation drawn many times.' },
  { id: 'w08', no: '08', title: 'Strata', artist: 'okonkwo', year: 2026, room: 4, algo: 'strata', palette: 'paper', aspect: 1.4, seed: 4004, params: { density: 0.5, chaos: 0.5 }, text: 'A sun sinking behind hills that were grown, not painted. Each band is one layer of noise, stacked like sediment.' },
  { id: 'w09', no: '09', title: 'Halftone Horizon', artist: 'okonkwo', year: 2025, room: 4, algo: 'halftone', palette: 'vermilion', aspect: 0.8, seed: 1212, params: { density: 0.55, chaos: 0.4 }, text: 'A horizon printed with dots alone, the way newspapers once printed photographs of distant places.' },
  { id: 'w10', no: '10', title: 'Constellation for One', artist: 'haddad', year: 2026, room: 5, algo: 'constellation', palette: 'gallery', aspect: 1.5, seed: 2026, params: { density: 0.5, chaos: 0.5 }, text: 'A network missing one point: you. Move across the work and it reaches out to connect.' }
];

export const ROOMS = [
  { n: 0, numeral: '', name: 'Entrance', wall: 'gallery' },
  { n: 1, numeral: 'I', name: 'Line', wall: 'gallery', intro: 'Three artists who start with a single stroke and repeat it until it becomes weather, cloth or terrain.' },
  { n: 2, numeral: 'II', name: 'Shape', wall: 'ochre', intro: 'Circles, quarters and bars. Rules so simple you could follow them with scissors, and results you could not predict.' },
  { n: 3, numeral: 'III', name: 'Orbit', wall: 'ink', intro: 'A darkened room for works that never stop moving. Let your eyes adjust.' },
  { n: 4, numeral: 'IV', name: 'Ground', wall: 'stone', intro: 'Landscapes grown from noise. Places that do not exist and still feel familiar.' },
  { n: 5, numeral: 'V', name: 'Network', wall: 'gallery', intro: 'One work, unfinished until somebody stands in front of it.' },
  { n: 6, numeral: 'VI', name: 'You', wall: 'vermilion', intro: 'The last wall is empty on purpose. Make something in the studio and hang it here.' }
];

export const PALETTES = {
  gallery: { name: 'Gallery', bg: '#F4F1EA', fg: '#111111', a1: '#E8452C', a2: '#D9A43B' },
  paper: { name: 'Paper', bg: '#EDE6D8', fg: '#1C1A17', a1: '#C23A22', a2: '#C8932C' },
  ochre: { name: 'Ochre', bg: '#D9A43B', fg: '#111111', a1: '#F7F6F2', a2: '#E8452C' },
  vermilion: { name: 'Vermilion', bg: '#E8452C', fg: '#111111', a1: '#F7F6F2', a2: '#D9A43B' },
  ink: { name: 'Ink', bg: '#111111', fg: '#F7F6F2', a1: '#E8452C', a2: '#D9A43B' }
};

export const RECIPES = [
  { algo: 'flow', name: 'Flow field' },
  { algo: 'truchet', name: 'Tiles' },
  { algo: 'strata', name: 'Strata' },
  { algo: 'orbitals', name: 'Orbit' },
  { algo: 'halftone', name: 'Halftone' },
  { algo: 'bauhaus', name: 'Composition' }
];

export const artistOf = (w) => ARTISTS.find((a) => a.id === w.artist);
export const roomName = (n) => { const r = ROOMS[n]; return r ? `Room ${r.numeral} · ${r.name}` : ''; };

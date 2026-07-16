// Fleet roster for Texas A&M University Transportation Services (Aggie Spirit),
// sourced from the CPTDB wiki (https://cptdb.ca/wiki/index.php/Texas_A%26M_University
// and its per-series sub-pages, e.g. .../Texas_A%26M_University_620-644).
// Vehicle numbers from the live feed (e.g. "B2013") map to a fleet block here
// by their numeric fleet number ("2013") via findFleetInfo().

export type FleetBlock = {
  /** Inclusive [min, max] numeric ranges this block covers; a fleet number can
   * fall in more than one gap-separated range (e.g. "660-665, 667-674"). */
  ranges: [number, number][];
  buildYear: string;
  manufacturer: string;
  model: string;
  engine: string;
  transmission?: string;
  seating?: string;
  electric?: boolean;
  retired?: boolean;
  notes?: string[];
  /** Per-fleet-number notes that only apply to specific units in the block
   * (e.g. only 2001/2002 got the Mobileye system), appended after `notes`. */
  unitNotes?: Record<number, string[]>;
};

export const FLEET_ROSTER: FleetBlock[] = [
  {
    ranges: [[620, 644]],
    buildYear: '2006–2007',
    manufacturer: 'MTS',
    model: 'RTS Legend (R80THN)',
    engine: 'Caterpillar C9',
    transmission: 'ZF 5HP592C',
    seating: '42 (American Seating 6466)',
    notes: ['Originally ordered by New Jersey Transit, rejected after Millennium Transit Services filed for bankruptcy — diverted to Texas A&M.'],
  },
  {
    ranges: [[645, 654]],
    buildYear: '2015',
    manufacturer: 'Gillig',
    model: "Low Floor 40' (G27D102N4)",
    engine: 'Cummins ISL9',
  },
  {
    ranges: [[660, 665], [667, 674]],
    buildYear: '2000–2002',
    manufacturer: 'Gillig',
    model: "Low Floor 40' (G18D102N4)",
    engine: 'Cummins ISC (660–665) / Cummins ISL (667–668, 670–673)',
    transmission: 'Allison B400R (660–665) / Voith (667–668, 670–673)',
    seating: '39 on 667–668, 670–673 (American Seating 6468)',
    notes: ['Purchased second-hand from various transit agencies.'],
  },
  {
    ranges: [[2001, 2035]],
    buildYear: '2020',
    manufacturer: 'Gillig',
    model: "Low Floor 40' (G27D102N4)",
    engine: 'Cummins ISL9',
    transmission: 'Allison B400R',
    seating: 'Perimeter, 34 (American Seating)',
    notes: ['Delivered in fall 2020.'],
    unitNotes: {
      2001: ['Equipped with Mobileye® Collision Avoidance System Shield+ V4.'],
      2002: ['Equipped with Mobileye® Collision Avoidance System Shield+ V4.'],
    },
  },
  {
    ranges: [[2101, 2103]],
    buildYear: '2021',
    manufacturer: 'Proterra',
    model: "ZX5 40'",
    engine: 'Dual-traction motors',
    transmission: 'Eaton EEV-7202',
    electric: true,
    notes: ["One of the campus fleet's few battery-electric buses."],
  },
  {
    ranges: [[2110, 2118]],
    buildYear: '2021',
    manufacturer: 'Gillig',
    model: "Low Floor 40' (G27D102N4)",
    engine: 'Cummins L9',
    transmission: 'Allison B400R',
    seating: 'Perimeter, 34 (American Seating)',
    notes: ['Delivered in fall 2021.'],
  },
  {
    ranges: [[5391, 5394]],
    buildYear: '2022',
    manufacturer: 'Ford / ElDorado National',
    model: 'E-450 Advantage (cutaway)',
    engine: 'Ford Triton V10 6.8L gasoline',
    notes: ['Runs Routes 07 and 48 almost exclusively.'],
  },
  // Retired — still worth showing if an old fleet number ever resurfaces in the feed.
  {
    ranges: [[101, 122]],
    buildYear: '2001',
    manufacturer: 'Nova Bus',
    model: 'RTS-06 (72VN)',
    engine: 'Detroit Diesel Series 50 EGR',
    transmission: 'ZF 5HP592C',
    seating: 'Perimeter, 34 (American Seating 6468, padded fabric)',
    retired: true,
    notes: ['Originally numbered 0101–0122.', 'Retired in 2020.'],
  },
  {
    ranges: [[201, 224]],
    buildYear: '2002',
    manufacturer: 'Nova Bus',
    model: 'RTS-06 (72VN)',
    engine: 'Detroit Diesel Series 50 EGR',
    transmission: 'ZF 5HP592C',
    seating: '34 (American Seating 6468, padded fabric)',
    retired: true,
    notes: ['Originally numbered 0201–0224.', 'Last units retired May 10, 2021.'],
  },
  {
    ranges: [[634, 634]],
    buildYear: '2007',
    manufacturer: 'MTS',
    model: 'RTS Legend (R80THN)',
    engine: 'Caterpillar C9',
    transmission: 'ZF 5HP592C',
    seating: '42 (American Seating 6466)',
    retired: true,
    notes: ['Pulled from service in 2019; used as a dispatch office during COVID.', 'Auctioned off in 2022.'],
  },
  {
    ranges: [[655, 659]],
    buildYear: '2000',
    manufacturer: 'Gillig',
    model: "Low Floor 40' (G18D102N4)",
    engine: 'Cummins ISC',
    transmission: 'Allison B400R',
    retired: true,
    notes: ['Originally Transit Authority of Northern Kentucky buses.'],
  },
  {
    ranges: [[1123, 1124]],
    buildYear: '2001',
    manufacturer: 'Nova Bus',
    model: 'RTS-06 (VN82)',
    engine: 'Detroit Diesel Series 50 EGR',
    transmission: 'ZF',
    seating: '43 (American Seating 6468)',
    retired: true,
    notes: ['Purchased from University of Georgia Campus Transit in 2015.', 'Ran primarily on Route 35 Hullabaloo.', 'Retired May 10, 2021.'],
  },
  {
    ranges: [[5150, 5153]],
    buildYear: '2013–2014',
    manufacturer: 'Ford / ElDorado National',
    model: 'E-450 Advantage (cutaway)',
    engine: 'Ford Triton V10 6.8L gasoline',
    seating: '20',
    retired: true,
    notes: ['Retired in summer 2022.'],
  },
];

export function findFleetInfo(busName: string): FleetBlock | null {
  const num = parseInt(busName.replace(/\D/g, ''), 10);
  if (!Number.isFinite(num)) return null;
  return FLEET_ROSTER.find(block => block.ranges.some(([min, max]) => num >= min && num <= max)) ?? null;
}

/** Block-level notes plus any notes specific to this exact fleet number. */
export function fleetNotesFor(busName: string, block: FleetBlock): string[] {
  const num = parseInt(busName.replace(/\D/g, ''), 10);
  const unitSpecific = Number.isFinite(num) ? block.unitNotes?.[num] ?? [] : [];
  return [...(block.notes ?? []), ...unitSpecific];
}

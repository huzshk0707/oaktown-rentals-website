/*
 * Oaktown Rentals public preview data, assembled 2026-11-04.
 * This file is the single place to update listing copy, pricing and photos.
 * Photos currently load from Oaktown's existing Squarespace CDN as a stopgap.
 * Replace with locally hosted copies before retiring Squarespace.
 * Availability is deliberately NOT represented as confirmed or live.
 */
window.OAKTOWN_DATA = {
  applicationUrl: 'https://oaktownrentalsapplication.fillout.com/95',
  squarespaceUrl: 'https://tuba-parsnip-36cr.squarespace.com/',
  phoneDisplay: '(502) 500-1070',
  phoneHref: 'tel:+15025001070',
  email: 'joejrandles@yahoo.com',
  mailingAddress: 'PO Box 7, Hillview, KY 40129',
  images: {
    colonial: [
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1788445509845-3IYPG6M4T5H6LTRBXCCP/1.webp',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1788445509846-SNZGCPNKYQ7QMCEXZW5C/2.webp',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1788445511143-83ORN69V1QHGBSEGABKQ/4.webp',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1788445513565-U6OHBZ5VT9X1IH1JAIS9/7.webp'
    ],
    smallboat: [
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1791289565023-RA7WCQBC3UKM7CEPL34V/1.webp',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1791289565117-3H2COCLMXG783O3YIX7C/2.webp',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1791289566505-2UED0P9YI9M1QBLPKIA1/4.webp'
    ],
    cherokee6: [
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/cca85aa1-2a3e-465c-a8ea-6956d2623ab6/1d9f81e6264b12c173816b4c176c43f0-cc_ft_960.webp'
    ],
    cherokee8: [
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1792672017451-EYEND4KY8UQK65DQE2H7/IMG_3986.jpeg',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1792672016789-CE51I5J15DO7ESFSLTB6/IMG_3985.jpeg',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1792672015937-H693OVW7OB1W6RCM2UWM/IMG_3984.jpeg'
    ],
    cudejoe: [
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1675783417395-1GBMGQGOPJZ81AQPED2M/IMG_5886%2B%281%29.jpg',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1675783422929-VKF8DRW9WNTRI8S9B22U/IMG_5875.jpg',
      'https://images.squarespace-cdn.com/content/v1/63e14d1decec832bd1971c00/1675783894144-DNFC7UAAYO5VDG8X3ZVI/IMG_8438.jpg'
    ]
  },
  properties: [
    {
      slug: '115-colonial-drive', name: '115 Colonial Drive', neighborhood: 'St. Matthews', city: 'Louisville, Kentucky',
      rent: 1799, deposit: 1799, bedrooms: 3, bathrooms: 1, imageKey: 'colonial',
      eyebrow: 'The classic, reimagined', label: 'A place to settle in',
      summary: 'Original oak hardwood floors, a light-filled living space, and a two-car garage in a quiet St. Matthews neighborhood.',
      summaryEs: 'Pisos originales de roble, espacios luminosos y garaje para dos autos en un vecindario tranquilo de St. Matthews.',
      description: [
        'A welcoming Louisville home on a quiet, low-traffic street, close to Chenoweth shops, the Vogue shopping area, groceries and convenient expressway access.',
        'The open kitchen, dining and living layout pairs original oak flooring with fresh paint. Two bedrooms and a full bathroom are on the main floor, with a third bedroom upstairs.',
        'An unfinished basement includes a laundry area. The separate two-car garage offers extra room for projects, hobbies and storage.'
      ],
      features: ['Original oak flooring', '3 bedrooms / 1 bathroom', 'Two-car garage', 'Laundry area', 'Unfinished basement', 'Convenient St. Matthews location'],
      terms: ['Tenants pay utilities', 'One-year lease listed', 'Pet terms and screening requirements: confirm before applying'],
      sourceUrl: 'https://tuba-parsnip-36cr.squarespace.com/115-colonial-drive',
      editorialNote: 'Rent and deposit of $1,799 reflect a newer client confirmation; Squarespace still displays $1,850. Reconfirm before publication.'
    },
    {
      slug: '1106-cherokee-rd-unit-6', name: '1106 Cherokee Rd · #6', neighborhood: 'The Highlands', city: 'Louisville, Kentucky',
      rent: 1000, deposit: 1000, bedrooms: 1, bathrooms: 1, imageKey: 'cherokee6',
      eyebrow: 'In the heart of the Highlands', label: 'Thoughtfully updated',
      summary: 'An updated one-bedroom with shaker cabinets, granite counters, tile floors and a spacious living room.',
      summaryEs: 'Apartamento renovado de un dormitorio con gabinetes shaker, granito, pisos de baldosas y sala amplia.',
      description: [
        'A fresh one-bedroom apartment in Louisville’s Highlands, with neighborhood restaurants, shops and parks nearby.',
        'The kitchen features shaker cabinets, granite counters and backsplash. Tile flooring runs throughout the unit, with a large living room and a dining area off the kitchen.',
        'The updated bathroom has tile surround and flooring. Parking is available behind the building and on the street in front.'
      ],
      features: ['Shaker-style cabinets', 'Granite counters and backsplash', 'Tile floors throughout', 'One bedroom / one bathroom', 'Rear and street parking', 'Highlands location'],
      terms: ['Tenants pay LG&E', 'City handles trash', 'Forced-air furnace; window A/C', 'One-year lease listed', 'Pet terms: confirm before applying'],
      sourceUrl: 'https://tuba-parsnip-36cr.squarespace.com/1119-ireland-drive-copy-1',
      editorialNote: 'Existing Squarespace listing link returned 404 when reviewed; this preview restores a usable details page. Needs approved full photo set.'
    },
    {
      slug: '4005-smallboat-ct', name: '4005 Smallboat Ct', neighborhood: 'Okolona', city: 'Louisville, Kentucky',
      rent: 1525, deposit: 1525, bedrooms: 3, bathrooms: 1, imageKey: 'smallboat',
      eyebrow: 'Everyday ease', label: 'Comfort all around',
      summary: 'A single-level classic brick home with updated flooring, a large kitchen and generous yard space.',
      summaryEs: 'Casa clásica de ladrillo de una planta, con pisos renovados, cocina amplia y un jardín espacioso.',
      description: [
        'A classic brick home in the Okolona area on a quiet, low-traffic street, with three bedrooms and one bathroom all on one level.',
        'The home includes a spacious living area, a large kitchen with wood cabinetry, updated bathroom and newer flooring. Listed appliances include a dishwasher, microwave and washer.',
        'Outside, a quarter-acre lot provides off-street parking and room to enjoy the lawn. Nearby shops and expressway access make daily errands convenient.'
      ],
      features: ['Three bedrooms / one bathroom', 'Single-level layout', 'Spacious kitchen', 'Central A/C and gas heat', 'Off-street parking', 'Approx. 0.25-acre lot'],
      terms: ['Tenants pay utilities', 'One-year lease listed', 'Showings and current availability must be confirmed'],
      sourceUrl: 'https://tuba-parsnip-36cr.squarespace.com/4005-smallboat-ct',
      editorialNote: 'The Squarespace description says showings after mid-October; date is now past. Do not present that as current availability.'
    },
    {
      slug: '1106-cherokee-rd-unit-8', name: '1106 Cherokee Rd · #8', neighborhood: 'Cherokee Triangle', city: 'Louisville, Kentucky',
      rent: 950, deposit: 950, bedrooms: 1, bathrooms: 1, imageKey: 'cherokee8',
      eyebrow: 'Old Louisville character', label: 'A little more charm',
      summary: 'Hardwood floors, a compact granite-topped kitchen and a shaded courtyard in the Cherokee Triangle.',
      summaryEs: 'Pisos de madera, cocina con encimeras de granito y patio sombreado en Cherokee Triangle.',
      description: [
        'A bright Highlands apartment in Cherokee Triangle, near Cherokee Park, Bardstown Road, neighborhood shopping and dining.',
        'The apartment includes a large living room with hardwood floors, a ceiling fan and closet space. The kitchen has white cabinetry, granite counters, a tile backsplash, a gas stove and refrigerator.',
        'A tiled bath, window A/C, ceiling fans and a covered walkway overlooking the shaded courtyard complete the space.'
      ],
      features: ['Hardwood flooring', 'Granite kitchen counters', 'Gas stove', 'Tiled bathroom', 'Window A/C', 'Covered courtyard walkway'],
      terms: ['Tenants pay LG&E', 'One-year lease listed', 'Pet terms: confirm before applying'],
      sourceUrl: 'https://tuba-parsnip-36cr.squarespace.com/1106-cherokee-rd-8',
      editorialNote: 'Rent/deposit from current Squarespace details. Confirm current availability before publishing this listing as available.'
    }
  ]
};
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const USER_AGENT = 'TravelBharat image updater';

const statePages = {
  'Andhra Pradesh': 'Andhra Pradesh',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  Assam: 'Assam',
  Bihar: 'Bihar',
  Chhattisgarh: 'Chhattisgarh',
  Goa: 'Goa',
  Gujarat: 'Gujarat',
  Haryana: 'Haryana',
  'Himachal Pradesh': 'Himachal Pradesh',
  Jharkhand: 'Jharkhand',
  Karnataka: 'Karnataka',
  Kerala: 'Kerala',
  'Madhya Pradesh': 'Madhya Pradesh',
  Maharashtra: 'Maharashtra',
  Manipur: 'Manipur',
  Meghalaya: 'Meghalaya',
  Mizoram: 'Mizoram',
  Nagaland: 'Nagaland',
  Odisha: 'Odisha',
  Punjab: 'Punjab, India',
  Rajasthan: 'Rajasthan',
  Sikkim: 'Sikkim',
  'Tamil Nadu': 'Tamil Nadu',
  Telangana: 'Telangana',
  Tripura: 'Tripura',
  'Uttar Pradesh': 'Uttar Pradesh',
  Uttarakhand: 'Uttarakhand',
  'West Bengal': 'West Bengal',
  'Andaman and Nicobar Islands': 'Andaman and Nicobar Islands',
  Chandigarh: 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  Delhi: 'Delhi',
  'Jammu and Kashmir': 'Jammu and Kashmir (union territory)',
  Ladakh: 'Ladakh',
  Lakshadweep: 'Lakshadweep',
  Puducherry: 'Puducherry'
};

const destinationPages = {
  'Hawa Mahal': 'Hawa Mahal',
  'Amber Fort': 'Amber Fort',
  'Jaisalmer Fort': 'Jaisalmer Fort',
  'Ranthambore National Park': 'Ranthambore National Park',
  'Pushkar Lake': 'Pushkar Lake',
  'Udaipur City Palace': 'City Palace, Udaipur',
  'Alleppey Backwaters': 'Kerala backwaters',
  'Munnar Tea Gardens': 'Munnar',
  'Kovalam Beach': 'Kovalam',
  'Periyar Wildlife Sanctuary': 'Periyar National Park',
  Wayanad: 'Wayanad',
  'Taj Mahal': 'Taj Mahal',
  'Varanasi Ghats': 'Ghats in Varanasi',
  'Agra Fort': 'Agra Fort',
  Manali: 'Manali, Himachal Pradesh',
  Shimla: 'Shimla',
  'Spiti Valley': 'Spiti Valley',
  'Calangute Beach': 'Calangute',
  'Basilica of Bom Jesus': 'Basilica of Bom Jesus',
  'Dudhsagar Falls': 'Dudhsagar Falls',
  Hampi: 'Hampi',
  'Mysore Palace': 'Mysore Palace',
  Coorg: 'Kodagu district',
  Gokarna: 'Gokarna, Karnataka',
  'Meenakshi Temple': 'Meenakshi Temple',
  Ooty: 'Ooty',
  Mahabalipuram: 'Group of Monuments at Mahabalipuram',
  Rameswaram: 'Ramanathaswamy Temple',
  'Kaziranga National Park': 'Kaziranga National Park',
  'Khajuraho Temples': 'Khajuraho Group of Monuments',
  'Bandhavgarh National Park': 'Bandhavgarh National Park',
  'Pangong Lake': 'Pangong Tso',
  'Nubra Valley': 'Nubra Valley',
  'Red Fort': 'Red Fort',
  'Qutub Minar': 'Qutb Minar',
  'India Gate': 'India Gate',
  Rishikesh: 'Rishikesh',
  'Valley of Flowers': 'Valley of Flowers National Park',
  'Radhanagar Beach': 'Radhanagar Beach',
  'Cellular Jail': 'Cellular Jail',
  Darjeeling: 'Darjeeling',
  Sundarbans: 'Sundarbans',
  Tirupati: 'Tirumala Venkateswara Temple',
  'Araku Valley': 'Araku Valley',
  'Tawang Monastery': 'Tawang Monastery',
  'Ziro Valley': 'Ziro',
  'Bodh Gaya': 'Mahabodhi Temple',
  'Nalanda Ruins': 'Nalanda mahavihara',
  'Chitrakote Falls': 'Chitrakote Falls',
  Sirpur: 'Sirpur Group of Monuments',
  'Rann of Kutch': 'Great Rann of Kutch',
  'Gir National Park': 'Gir National Park',
  Kurukshetra: 'Kurukshetra',
  'Sultanpur Bird Sanctuary': 'Sultanpur National Park',
  'Hundru Falls': 'Hundru Falls',
  Deoghar: 'Baidyanath Temple',
  'Loktak Lake': 'Loktak Lake',
  'Keibul Lamjao National Park': 'Keibul Lamjao National Park',
  'Living Root Bridge': 'Living root bridge',
  'Dawki River': 'Dawki',
  'Phawngpui Peak': 'Phawngpui',
  'Palak Lake': 'Palak Dil',
  'Dzuko Valley': 'Dzuko Valley',
  'Kohima War Cemetery': 'Kohima War Cemetery',
  'Konark Sun Temple': 'Konark Sun Temple',
  'Chilika Lake': 'Chilika Lake',
  'Golden Temple': 'Golden Temple',
  'Wagah Border': 'Wagah-Attari border ceremony',
  'Tsomgo Lake': 'Tsomgo Lake',
  Pelling: 'Pelling',
  Charminar: 'Charminar',
  'Golconda Fort': 'Golconda Fort',
  Neermahal: 'Neermahal',
  Unakoti: 'Unakoti',
  'Havelock Island': 'Havelock Island',
  'Rock Garden': 'Rock Garden of Chandigarh',
  'Diu Fort': 'Diu Fort',
  Gulmarg: 'Gulmarg',
  'Bangaram Island': 'Bangaram Atoll',
  'Paradise Beach': 'Paradise Beach, Puducherry',
  'Agatti Island': 'Agatti Island',
  'Ajanta Caves': 'Ajanta Caves',
  Lonavala: 'Lonavala',
  Majuli: 'Majuli',
  'French Quarter': 'Puducherry',
  'Sukhna Lake': 'Sukhna Lake',
  'Jampore Beach': 'Jampore Beach',
  'Dal Lake': 'Dal Lake'
};

const galleryPages = {
  'Taj Mahal at Sunrise': 'Taj Mahal',
  'Varanasi Ganga Aarti': 'Ghats in Varanasi',
  'Hawa Mahal Jaipur': 'Hawa Mahal',
  'Kerala Backwaters': 'Kerala backwaters',
  'Goa Sunset Beach': 'Calangute',
  'Manali Snowfall': 'Manali, Himachal Pradesh',
  'Hampi Ruins': 'Hampi',
  'Munnar Tea Garden': 'Munnar',
  'India Gate Delhi': 'India Gate',
  'Meenakshi Temple': 'Meenakshi Temple',
  'Pangong Lake Ladakh': 'Pangong Tso',
  'Kaziranga Rhino': 'Kaziranga National Park',
  'Andaman Beach': 'Havelock Island',
  'Darjeeling Tea': 'Darjeeling',
  'Golden Temple Amritsar': 'Golden Temple',
  'Rishikesh Rafting': 'Rishikesh',
  'Jaisalmer Desert': 'Jaisalmer Fort',
  'Mysore Palace Night': 'Mysore Palace',
  'Coorg Coffee Estate': 'Kodagu district',
  'Khajuraho Temples': 'Khajuraho Group of Monuments',
  'Valley of Flowers': 'Valley of Flowers National Park',
  'Nubra Valley Camels': 'Nubra Valley',
  'Dudhsagar Waterfall': 'Dudhsagar Falls',
  'Sundarbans Mangrove': 'Sundarbans',
  'Tirupati Temple Lights': 'Tirumala Venkateswara Temple',
  'Rann of Kutch White Desert': 'Great Rann of Kutch',
  'Golden Temple Reflection': 'Golden Temple',
  'Charminar Evenings': 'Charminar',
  'Rock Garden Paths': 'Rock Garden of Chandigarh',
  'Gulmarg Slopes': 'Gulmarg'
};

const fallbackImages = {
  Puducherry: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pondicherry_shoreline.jpg?width=1200',
  'French Quarter': 'https://commons.wikimedia.org/wiki/Special:FilePath/French_Quarter,_Pondicherry.jpg?width=1200'
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resizeWikimediaImage(url) {
  if (!url) return null;
  return url.replace(/\/\d+px-([^/]+)$/, '/1200px-$1');
}

async function fetchWikipediaImage(pageTitle, attempt = 1) {
  const url = WIKI_API + encodeURIComponent(pageTitle.replace(/ /g, '_'));
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  if (response.status === 429 && attempt <= 4) {
    await sleep(1500 * attempt);
    return fetchWikipediaImage(pageTitle, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${pageTitle}`);
  }

  const page = await response.json();
  return resizeWikimediaImage(page.originalimage?.source || page.thumbnail?.source);
}

async function buildImageMap(pageMap, label) {
  const images = {};

  for (const [name, pageTitle] of Object.entries(pageMap)) {
    await sleep(350);
    try {
      const imageUrl = await fetchWikipediaImage(pageTitle);
      images[name] = imageUrl || fallbackImages[name] || null;
      if (!images[name]) {
        console.warn(`No image found for ${label}: ${name}`);
      }
    } catch (error) {
      images[name] = fallbackImages[name] || null;
      console.warn(`Skipped ${label} ${name}: ${error.message}`);
    }
  }

  return Object.fromEntries(Object.entries(images).filter(([, imageUrl]) => imageUrl));
}

async function buildImageMaps() {
  console.log('Resolving state images from Wikimedia...');
  const stateImages = await buildImageMap(statePages, 'state');
  console.log(`Resolved ${Object.keys(stateImages).length} state images.`);

  console.log('Resolving destination images from Wikimedia...');
  const destinationImages = await buildImageMap(destinationPages, 'destination');
  console.log(`Resolved ${Object.keys(destinationImages).length} destination images.`);

  console.log('Resolving gallery images from Wikimedia...');
  const galleryImages = await buildImageMap(galleryPages, 'gallery image');
  console.log(`Resolved ${Object.keys(galleryImages).length} gallery images.`);

  return { stateImages, destinationImages, galleryImages };
}

async function updateDatabase({ stateImages, destinationImages, galleryImages }) {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Skipping database updates.');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Connected to database. Updating images...');

    for (const [name, imageUrl] of Object.entries(stateImages)) {
      await pool.query('UPDATE states SET image_url = $1 WHERE name = $2', [imageUrl, name]);
    }
    console.log('States image URLs updated.');

    for (const [name, imageUrl] of Object.entries(destinationImages)) {
      await pool.query('UPDATE destinations SET image_url = $1 WHERE name = $2', [imageUrl, name]);
      await pool.query('UPDATE gallery_images SET image_url = $1 WHERE title ILIKE $2', [imageUrl, `%${name}%`]);
    }
    console.log('Destination image URLs updated.');

    for (const [title, imageUrl] of Object.entries(galleryImages)) {
      await pool.query('UPDATE gallery_images SET image_url = $1 WHERE title = $2', [imageUrl, title]);
    }
    console.log('Gallery image URLs updated.');
  } catch (err) {
    console.error('Failed to update database:', err);
  } finally {
    await pool.end();
  }
}

function replaceUnsplashUrls(line, imageMap) {
  let updated = line;

  for (const [name, imageUrl] of Object.entries(imageMap)) {
    if (updated.includes(`'${name.replace(/'/g, "''")}'`)) {
      updated = updated.replace(/https:\/\/images\.unsplash\.com\/photo-[^']+/g, imageUrl);
    }
  }

  return updated;
}

function updateSqlFiles(imageMaps) {
  const files = ['seed.sql', 'seed-extra.sql'];
  const combinedMaps = {
    ...imageMaps.stateImages,
    ...imageMaps.destinationImages,
    ...imageMaps.galleryImages
  };

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content
      .split('\n')
      .map((line) => replaceUnsplashUrls(line, combinedMaps))
      .join('\n');

    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated SQL file: ${file}`);
  }
}

async function main() {
  const imageMaps = await buildImageMaps();
  await updateDatabase(imageMaps);
  updateSqlFiles(imageMaps);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to update images:', error);
    process.exitCode = 1;
  });
}

module.exports = { statePages, destinationPages, galleryPages, buildImageMaps };

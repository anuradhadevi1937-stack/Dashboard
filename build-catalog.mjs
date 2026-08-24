import fs from 'fs';

const productsSql = fs.readFileSync('C:\\Users\\anura\\Desktop\\products_rows (1).sql', 'utf8');
const destinationsSql = fs.readFileSync('C:\\Users\\anura\\Desktop\\destinations_rows.sql', 'utf8');

// Parse destinations
// INSERT INTO "travel_esim"."destinations" ("destination_id", "destination_type", "destination_name", "flag_path", "included_destinations", "is_active") VALUES ...
const destRegex = /\('([^']*)',\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+)\)/g;
const destinations = {};
let match;
while ((match = destRegex.exec(destinationsSql)) !== null) {
  const [_, destination_id, destination_type, destination_name, flag_path, included_destinations, is_active] = match;
  if (destination_id) {
    destinations[destination_id] = {
      destination_id,
      destination_type: parseInt(destination_type, 10),
      destination_name,
      flag_path,
      included_destinations,
      is_active: parseInt(is_active, 10),
    };
  }
}

console.log('Parsed Destinations Count:', Object.keys(destinations).length);

// Parse products
// INSERT INTO "public"."products" ("prod_id", "addOnId", "data_limit", "simMode", "fupLimit", "operatorId", "additional_note", "amount", "productName", "postFupSpeed", "validity", "coverageDestinations", "allocatedDestinations") VALUES ...
// Sample: (1001, 'eSim-PB-SG-VA-1-5-16', 0, 2, 1, 105, '', 507.63, 'eSIM - Singapore, Malaysia - 1 GB/Day For 5 Days', 128, 5, 'SGP,MYS', 'SGP,MYS,SGMY')
const prodRegex = /\((\d+),\s*'([^']*)',\s*([^,]+),\s*(\d+),\s*([^,]+),\s*(\d+),\s*'([^']*)',\s*([\d\.]+),\s*'([^']*)',\s*([^,]+),\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/g;
const products = {};
while ((match = prodRegex.exec(productsSql)) !== null) {
  const [
    _,
    prod_id,
    addOnId,
    data_limit,
    simMode,
    fupLimit,
    operatorId,
    additional_note,
    amount,
    productName,
    postFupSpeed,
    validity,
    coverageDestinations,
    allocatedDestinations,
  ] = match;
  
  const id = parseInt(prod_id, 10);
  products[id] = {
    prod_id: id,
    addOnId,
    data_limit: data_limit === 'null' ? 0 : parseFloat(data_limit),
    simMode: parseInt(simMode, 10),
    fupLimit: fupLimit === 'null' ? null : parseFloat(fupLimit),
    operatorId: parseInt(operatorId, 10),
    additional_note,
    amount: parseFloat(amount),
    productName,
    postFupSpeed: postFupSpeed === 'null' ? null : parseInt(postFupSpeed, 10),
    validity: parseInt(validity, 10),
    coverageDestinations,
    allocatedDestinations,
  };
}

console.log('Parsed Products Count:', Object.keys(products).length);

// Output to src/lib/catalogData.ts
const code = `// Auto-generated catalog reference data from verified database dumps
import { Product, Destination } from '../types/database';

export const STATIC_DESTINATIONS_MAP: Record<string, Destination> = ${JSON.stringify(destinations, null, 2)};

export const STATIC_PRODUCTS_MAP: Record<number, Product> = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/lib/catalogData.ts', code, 'utf8');
console.log('Saved to src/lib/catalogData.ts successfully!');

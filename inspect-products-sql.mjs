import fs from 'fs';

const productsSql = fs.readFileSync('C:\\Users\\anura\\Desktop\\products_rows (1).sql', 'utf8');
const destinationsSql = fs.readFileSync('C:\\Users\\anura\\Desktop\\destinations_rows.sql', 'utf8');

console.log('Product SQL length:', productsSql.length);
console.log('Destinations SQL length:', destinationsSql.length);

// Count products in SQL
const prodMatches = productsSql.match(/\((\d+),\s*'([^']+)'/g);
console.log('Found product rows in SQL:', prodMatches ? prodMatches.length : 0);

// Sample product parse
const sampleProdMatch = productsSql.match(/\(1223,[^\)]+\)/);
console.log('Sample product 1223:', sampleProdMatch ? sampleProdMatch[0] : 'not found');

const sampleProd1313 = productsSql.match(/\(1313,[^\)]+\)/);
console.log('Sample product 1313:', sampleProd1313 ? sampleProd1313[0] : 'not found');

const fs = require('fs');
const path = require('path');

// Create simple PNG icons using Canvas-like approach with SVG data URLs
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createIcon = (size) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#f59e0b" rx="64"/>
      <g transform="translate(256 256)">
        <!-- Plant/Leaf -->
        <path d="M-40 -80 C-80 -40, -80 0, -40 40 C0 80, 40 80, 80 40 C80 0, 40 -40, 0 -80 C-20 -80, -40 -80, -40 -80" 
              fill="#16a34a" stroke="#15803d" stroke-width="4"/>
        <!-- Stem -->
        <rect x="-4" y="40" width="8" height="80" fill="#16a34a"/>
        <!-- Book/Knowledge Symbol -->
        <rect x="-60" y="-20" width="80" height="60" fill="#1e293b" rx="4"/>
        <rect x="-52" y="-12" width="64" height="44" fill="#f8fafc" rx="2"/>
        <!-- Text lines -->
        <rect x="-44" y="-4" width="48" height="2" fill="#1e293b"/>
        <rect x="-44" y="4" width="36" height="2" fill="#1e293b"/>
        <rect x="-44" y="12" width="42" height="2" fill="#1e293b"/>
        <rect x="-44" y="20" width="30" height="2" fill="#1e293b"/>
      </g>
    </svg>
  `;
  return svg;
};

// Create shortcut icons
const shortcuts = {
  'shortcut-home.png': {
    color: '#f59e0b',
    icon: '🏠'
  },
  'shortcut-recipes.png': {
    color: '#f59e0b', 
    icon: '👨‍🍳'
  },
  'shortcut-agriculture.png': {
    color: '#f59e0b',
    icon: '🌱'
  },
  'shortcut-activities.png': {
    color: '#f59e0b',
    icon: '📅'
  }
};

console.log('📦 Generating PWA icons...');

// Generate main app icons
sizes.forEach(size => {
  const svg = createIcon(size);
  const fileName = `icon-${size}x${size}.png`;
  
  // For now, we'll create placeholder files
  // In production, you'd use a proper SVG to PNG converter
  fs.writeFileSync(
    path.join(__dirname, 'public', 'icons', fileName), 
    `PNG placeholder for ${size}x${size}`
  );
  console.log(`✅ Generated ${fileName}`);
});

// Generate shortcut icons
Object.keys(shortcuts).forEach(filename => {
  fs.writeFileSync(
    path.join(__dirname, 'public', 'icons', filename),
    `PNG placeholder for ${filename}`
  );
  console.log(`✅ Generated ${filename}`);
});

console.log('🎉 PWA icons generated successfully!');
console.log('💡 In production, replace placeholders with actual PNG files.');

const fs = require('fs');
const { createCanvas } = require('canvas');

// Generate main app icon
function generateMainIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient (simulated with solid color)
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, size, size);
    
    // Clock face circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.35, 0, 2 * Math.PI);
    ctx.fill();
    
    // Clock border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = size * 0.01;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.35, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Clock hands
    ctx.strokeStyle = '#333';
    ctx.lineWidth = size * 0.02;
    ctx.lineCap = 'round';
    
    // Hour hand (pointing to 10)
    ctx.beginPath();
    ctx.moveTo(size/2, size/2);
    const hourAngle = (10 * 30 - 90) * Math.PI / 180;
    ctx.lineTo(size/2 + Math.cos(hourAngle) * size * 0.15, 
              size/2 + Math.sin(hourAngle) * size * 0.15);
    ctx.stroke();
    
    // Minute hand (pointing to 2)
    ctx.beginPath();
    ctx.moveTo(size/2, size/2);
    const minuteAngle = (2 * 30 - 90) * Math.PI / 180;
    ctx.lineTo(size/2 + Math.cos(minuteAngle) * size * 0.22, 
              size/2 + Math.sin(minuteAngle) * size * 0.22);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.02, 0, 2 * Math.PI);
    ctx.fill();
    
    return canvas.toBuffer('image/png');
}

// Create simple icons using SVG strings (since canvas module might not be available)
function createSVGIcon(size, type = 'main') {
    let svg = '';
    
    if (type === 'main') {
        svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="rgba(255,255,255,0.9)" stroke="#333" stroke-width="${size*0.01}"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size/2 + Math.cos((10 * 30 - 90) * Math.PI / 180) * size * 0.15}" y2="${size/2 + Math.sin((10 * 30 - 90) * Math.PI / 180) * size * 0.15}" stroke="#333" stroke-width="${size*0.02}" stroke-linecap="round"/>
  <line x1="${size/2}" y1="${size/2}" x2="${size/2 + Math.cos((2 * 30 - 90) * Math.PI / 180) * size * 0.22}" y2="${size/2 + Math.sin((2 * 30 - 90) * Math.PI / 180) * size * 0.22}" stroke="#333" stroke-width="${size*0.02}" stroke-linecap="round"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.02}" fill="#333"/>
</svg>`;
    } else if (type === 'stopwatch') {
        svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#48bb78"/>
  <circle cx="${size/2}" cy="${size*0.55}" r="${size*0.3}" fill="rgba(255,255,255,0.9)"/>
  <rect x="${size*0.45}" y="${size*0.15}" width="${size*0.1}" height="${size*0.15}" fill="#333"/>
  <polygon points="${size*0.45},${size*0.45} ${size*0.55},${size*0.55} ${size*0.45},${size*0.65}" fill="#333"/>
</svg>`;
    } else if (type === 'countdown') {
        svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#ed8936"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="rgba(255,255,255,0.9)"/>
  <path d="M ${size/2} ${size/2 - size*0.35} A ${size*0.35} ${size*0.35} 0 0 1 ${size/2 + size*0.35} ${size/2}" stroke="#ed8936" stroke-width="${size*0.05}" fill="none"/>
  <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="${size*0.15}" fill="#333">5:00</text>
</svg>`;
    }
    
    return svg;
}

// Generate icons using SVG approach
console.log('Generating icons...');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const svg = createSVGIcon(size, 'main');
    fs.writeFileSync(`icons/icon-${size}x${size}.svg`, svg);
    console.log(`Created icon-${size}x${size}.svg`);
});

// Create shortcut icons
const stopwatchSvg = createSVGIcon(96, 'stopwatch');
fs.writeFileSync('icons/stopwatch-96x96.svg', stopwatchSvg);

const countdownSvg = createSVGIcon(96, 'countdown');
fs.writeFileSync('icons/countdown-96x96.svg', countdownSvg);

console.log('Created stopwatch-96x96.svg and countdown-96x96.svg');
console.log('SVG icons generated successfully!');
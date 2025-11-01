#!/bin/bash

# Create PNG icons from SVG using built-in tools
echo "Converting SVG icons to PNG..."

# Check if we have librsvg-convert (rsvg-convert)
if command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    
    # Convert main icons
    rsvg-convert icons/icon-512x512.svg -w 512 -h 512 -o icons/icon-512x512.png
    rsvg-convert icons/icon-192x192.svg -w 192 -h 192 -o icons/icon-192x192.png
    
    # Create other sizes from 512x512
    rsvg-convert icons/icon-512x512.svg -w 384 -h 384 -o icons/icon-384x384.png
    rsvg-convert icons/icon-512x512.svg -w 152 -h 152 -o icons/icon-152x152.png
    rsvg-convert icons/icon-512x512.svg -w 144 -h 144 -o icons/icon-144x144.png
    rsvg-convert icons/icon-512x512.svg -w 128 -h 128 -o icons/icon-128x128.png
    rsvg-convert icons/icon-512x512.svg -w 96 -h 96 -o icons/icon-96x96.png
    rsvg-convert icons/icon-512x512.svg -w 72 -h 72 -o icons/icon-72x72.png
    
    # Convert shortcut icons
    rsvg-convert icons/stopwatch-96x96.svg -w 96 -h 96 -o icons/stopwatch-96x96.png
    rsvg-convert icons/countdown-96x96.svg -w 96 -h 96 -o icons/countdown-96x96.png
    
elif command -v qlmanage &> /dev/null; then
    echo "Using qlmanage (macOS)..."
    # On macOS, we can use qlmanage but it's limited
    # Let's use a different approach with sips if available
    
    if command -v sips &> /dev/null; then
        echo "Using sips to convert..."
        # sips can't directly convert SVG, so we'll use a web-based approach
        echo "SVG to PNG conversion requires additional tools on macOS"
        echo "Please install librsvg: brew install librsvg"
    fi
    
else
    echo "No SVG to PNG converter found."
    echo "Please install one of the following:"
    echo "- On macOS: brew install librsvg"
    echo "- On Ubuntu/Debian: sudo apt-get install librsvg2-bin"
    echo "- Or use an online SVG to PNG converter"
fi

echo "Icon conversion script completed!"
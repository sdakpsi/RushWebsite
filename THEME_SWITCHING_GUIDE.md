# 🎨 Theme Switching Guide

This guide explains how to easily change the theme and branding for future rush seasons.

## Quick Theme Change

### Step 1: Choose Your Theme
In `/utils/theme.ts`, you'll find three pre-configured themes:
- `currentTheme` (Blue theme - currently active)
- `springTheme` (Green theme)
- `fallTheme` (Orange theme)

### Step 2: Switch Themes
To switch to a different theme, simply change the export in `/utils/theme.ts`:

```typescript
// Change this line:
export const currentTheme: Theme = {
  // current theme config
};

// To this (for example, to use spring theme):
export const currentTheme: Theme = springTheme;
```

### Step 3: Update Branding Info
Update the branding information in your chosen theme:

```typescript
branding: {
  rushYear: "Spring '26",           // Update rush season
  organization: "UCSD Alpha Kappa Psi",
  website: "https://www.akpsiucsd.com",
  rushChairs: "contact [New Names] @ [New Phone Numbers]",
}
```

### Step 4: Rebuild the App
Run the following commands:
```bash
npm run build
npm run start
```

## Creating a Custom Theme

### Option 1: Modify Existing Theme
Edit the colors in `/utils/theme.ts`:

```typescript
export const customTheme: Theme = {
  name: "My Custom Theme",
  colors: {
    primary: "350 80% 50%",        // Pink theme example
    primaryForeground: "0 0% 100%",
    // ... update other colors as needed
  },
  branding: {
    // ... your branding info
  }
};
```

### Option 2: Use the Color Generator
Use online HSL color pickers to generate new color schemes:
- [HSL Color Picker](https://hslpicker.com/)
- [Coolors.co](https://coolors.co/)

### Color Format
All colors use HSL format: `"hue saturation% lightness%"`
- **Hue**: 0-360 (color wheel position)
- **Saturation**: 0-100% (color intensity)
- **Lightness**: 0-100% (how light/dark)

Examples:
- Blue: `"220 70% 50%"`
- Green: `"142 76% 36%"`
- Orange: `"25 95% 53%"`
- Pink: `"350 80% 50%"`
- Purple: `"280 70% 50%"`

## Theme Components

### Colors Explained
- **Primary**: Main brand color (buttons, links, accents)
- **Secondary**: Subtle backgrounds and secondary elements
- **Accent**: Hover states and highlights
- **Background**: Main page background
- **Foreground**: Main text color
- **Muted**: Less prominent text and backgrounds
- **Border**: Border colors throughout the app

### Files That Use Theme System
1. `/app/globals.css` - CSS variables and component styles
2. `/tailwind.config.js` - Tailwind color configuration
3. `/utils/theme.ts` - Theme definitions and branding
4. `/utils/constants.ts` - Exports theme values for use in components

## Testing Your Theme

1. **Development Mode**: Run `npm run dev` to see changes in real-time
2. **Check All Pages**: Navigate through all pages to ensure consistency
3. **Mobile Testing**: Test on different screen sizes
4. **Dark Mode**: If implementing, test `.dark` class themes

## Common Theme Combinations

### Professional Blue (Current)
```typescript
primary: "220 70% 50%"           // Professional blue
accent: "210 40% 90%"            // Light blue-gray
```

### Nature Green
```typescript
primary: "142 76% 36%"           // Forest green
accent: "120 40% 90%"            // Light sage
```

### Warm Orange
```typescript
primary: "25 95% 53%"            // Vibrant orange
accent: "30 40% 90%"             // Warm cream
```

### Modern Purple
```typescript
primary: "280 70% 50%"           // Rich purple
accent: "290 40% 90%"            // Light lavender
```

## Troubleshooting

### Theme Not Updating?
1. Clear browser cache
2. Restart development server
3. Check for TypeScript errors

### Colors Look Wrong?
1. Verify HSL format: `"hue saturation% lightness%"`
2. Ensure percentages include the `%` symbol
3. Check that all required color properties are defined

### Branding Not Updating?
1. Ensure you've updated the theme in `/utils/theme.ts`
2. Check that `/utils/constants.ts` is importing from the correct theme
3. Restart the application

## Quick Color Palette Generators

For quick theme generation, try these color combinations:

**Monochromatic** (same hue, different saturation/lightness):
```typescript
primary: "220 70% 50%"
accent: "220 40% 90%"
secondary: "220 20% 98%"
```

**Complementary** (opposite hues):
```typescript
primary: "220 70% 50%"    // Blue
accent: "40 70% 50%"      // Orange
```

**Analogous** (adjacent hues):
```typescript
primary: "220 70% 50%"    // Blue
accent: "200 70% 50%"     // Blue-cyan
```

---

## Need Help?

If you need assistance with theme switching or have questions about customization, refer to:
- Tailwind CSS documentation for color usage
- HSL color theory for color combinations
- The existing theme files for examples

Remember: Always test thoroughly before deploying to production!

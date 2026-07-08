# evabharati

A romantic Three.js love letter for Eva Bharati — [evabharati.com](https://evabharati.com)

## Features

- Immersive Three.js scene with floating hearts, aurora gradients & 3D photo frames
- Cinematic photo slideshow with Ken Burns effect
- Background music playlist (YouTube)
- "Text Me Here" contact form → yourlove@evabharati.com

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Deploy the `dist/` folder to GitHub Pages, Vercel, Netlify, or your domain host.

### Custom Domain

Point `evabharati.com` DNS to your hosting provider and add a `CNAME` record.

## Contact Form

Uses [FormSubmit](https://formsubmit.co) to deliver messages to `yourlove@evabharati.com`. On first submission, FormSubmit will send a confirmation email to activate the address.

## Music

Songs play via YouTube IFrame API after the user clicks "Enter Our World" (required by browser autoplay policies).

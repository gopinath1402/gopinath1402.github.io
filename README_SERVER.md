# How to Run Your Website Locally

## The Problem
When you open HTML files directly (double-click or `file://`), browsers block JavaScript from fetching `.txt` files due to CORS security restrictions.

## The Solution: Use a Local HTTP Server

### Option 1: Python (Recommended - Already Installed)
1. Open Command Prompt or PowerShell
2. Navigate to your website folder:
   ```
   cd D:\Rajesh_web
   ```
3. Start the server:
   ```
   python -m http.server 8000
   ```
4. Open your browser and go to:
   ```
   http://localhost:8000/content.html
   ```

### Option 2: Node.js (if you have it)
```
cd D:\Rajesh_web
npx http-server -p 8000
```

### Option 3: PHP (if you have it)
```
cd D:\Rajesh_web
php -S localhost:8000
```

## After Starting Server
- The server will keep running until you press `Ctrl+C`
- Access your site at: `http://localhost:8000/`
- Home page: `http://localhost:8000/index.html`
- Content page: `http://localhost:8000/content.html`
- Contact page: `http://localhost:8000/contact.html`

## Why This Works
- HTTP server allows JavaScript to fetch `.txt` files
- Changes to `.txt` files are reflected immediately on refresh
- This simulates how your site will work on GoDaddy

## For Production (GoDaddy)
When you upload to GoDaddy, everything will work automatically because:
- GoDaddy serves files via HTTP/HTTPS
- No CORS restrictions
- All `.txt` files will load correctly


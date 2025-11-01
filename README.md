# Finance Professional Personal Website

A modern, responsive personal website for finance professionals featuring a home page, content page (with documents and YouTube videos), and contact page. Ready for deployment on GoDaddy hosting.

## Features

- **Home Page**: Welcome section, about me, highlights, and call-to-action
- **Content Page**: Organized tabs for YouTube videos, documents, and articles
- **Contact Page**: Contact information and functional contact form
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations

## File Structure

```
.
├── index.html          # Home page
├── content.html        # Content page (videos, documents, articles)
├── contact.html        # Contact page
├── styles.css          # All styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Deployment to GoDaddy

### Option 1: Using GoDaddy File Manager (Recommended for beginners)

1. **Log in to GoDaddy**
   - Go to [GoDaddy.com](https://www.godaddy.com) and log into your account
   - Navigate to your hosting dashboard

2. **Access File Manager**
   - In your hosting control panel, find and click on "File Manager" or "cPanel" → "File Manager"
   - Navigate to the `public_html` folder (this is where your website files go)

3. **Upload Files**
   - Delete any default files (like `index.html` if it exists) from `public_html`
   - Upload all the website files (`index.html`, `content.html`, `contact.html`, `styles.css`, `script.js`) to the `public_html` folder
   - You can drag and drop files or use the upload button

4. **Verify**
   - Visit your domain name in a browser
   - Your website should now be live!

### Option 2: Using FTP (File Transfer Protocol)

1. **Get FTP Credentials**
   - In your GoDaddy hosting dashboard, find "FTP" or "FTP Accounts"
   - Note your FTP hostname, username, and password
   - FTP hostname is usually: `ftp.yourdomain.com` or `your-ip-address`

2. **Use FTP Client**
   - Download an FTP client like FileZilla (free) or WinSCP
   - Connect using your FTP credentials
   - Navigate to the `public_html` folder on the server

3. **Upload Files**
   - Upload all website files to `public_html`
   - Make sure `index.html` is in the root of `public_html`

4. **Verify**
   - Visit your domain name
   - Your website should be live!

### Option 3: Using cPanel File Manager

1. **Access cPanel**
   - Log into your GoDaddy account
   - Open your hosting product
   - Click "cPanel Admin"

2. **Open File Manager**
   - In cPanel, find and click "File Manager"
   - Navigate to `public_html`

3. **Upload Files**
   - Click "Upload" button
   - Select all your website files
   - Wait for upload to complete

4. **Set Permissions** (if needed)
   - Right-click files and ensure permissions are set to 644 for files
   - Folder permissions should be 755

## Customization

### Update Contact Information

1. Open `contact.html`
2. Find the contact information section
3. Update email, phone, and location as needed

### Update YouTube Video Links

1. Open `content.html`
2. Find the YouTube videos section
3. Replace `data-youtube-id` attributes with your actual YouTube video IDs
4. Or replace the entire video link structure with your YouTube channel URLs

### Update Document Links

1. Upload your PDF documents to a folder (e.g., `documents/` folder)
2. Update the document links in `content.html` to point to your actual PDF files

### Change Colors and Branding

1. Open `styles.css`
2. Find the `:root` section at the top
3. Modify the color variables:
   - `--primary-color`: Main brand color
   - `--secondary-color`: Secondary color
   - `--accent-color`: Accent color

### Update Logo/Name

1. Open all HTML files (`index.html`, `content.html`, `contact.html`)
2. Find `<div class="logo">Finance Pro</div>`
3. Replace "Finance Pro" with your name or brand

## Contact Form Setup

The contact form is currently set up for frontend validation. To make it functional, you have several options:

### Option 1: Use Formspree (Free, Easy)
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Get your form endpoint URL
4. In `contact.html`, update the form action:
   ```html
   <form class="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
5. Update `script.js` to submit to Formspree instead of showing a success message

### Option 2: Use EmailJS (Free, Easy)
1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Set up email service
3. Add EmailJS script to your HTML
4. Update the form submission in `script.js`

### Option 3: Use GoDaddy Email Forwarding
- Set up email forwarding in your GoDaddy account
- Use a simple mailto link or integrate with a PHP script

## Browser Compatibility

This website works on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For issues or questions:
- Check GoDaddy's support documentation
- Review the HTML/CSS/JS files for customization
- Test locally before uploading to ensure everything works

## License

Free to use and modify for personal websites.

---

**Note**: Remember to replace placeholder content (like email addresses, phone numbers, YouTube video IDs) with your actual information before going live!


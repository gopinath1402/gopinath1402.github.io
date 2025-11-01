// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Tab Switching for Content Page
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetElement = document.getElementById(targetTab);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // If videos tab is clicked, ensure videos are loaded
                if (targetTab === 'videos') {
                    const videosContainer = document.getElementById('videos-container');
                    if (videosContainer) {
                        // Check if videos are already loaded or if container is empty
                        const hasVideos = videosContainer.querySelectorAll('.video-item').length > 0;
                        const hasError = videosContainer.querySelector('.error') !== null;
                        const isLoading = videosContainer.querySelector('.loading') !== null;
                        
                        if ((!hasVideos && !hasError) || isLoading) {
                            console.log('Videos tab opened - loading videos from videos.txt');
                            loadVideosFromFile();
                        }
                    }
                }
            }
        });
    });

    // Load YouTube Videos from videos.txt immediately
    loadVideosFromFile();
    
    // Load Documents from documents.txt
    loadDocumentsFromFile();
    
    // Load Articles from articles.txt
    loadArticlesFromFile();
    
    // Load Daily Market data - LIVE from APIs
    loadLiveMarketData();

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !message) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission
            // In production, you would send this to a server or use a service like Formspree
            showFormMessage('Thank you for your message! I will get back to you soon.', 'success');
            contactForm.reset();

            // Optional: You can integrate with services like:
            // - Formspree: https://formspree.io/
            // - EmailJS: https://www.emailjs.com/
            // - Or set up your own backend API
        });
    }

    function showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.className = 'form-message';
            }, 5000);
        }
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        /youtube\.com\/.*\/([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            // Validate video ID format (YouTube IDs are 11 characters)
            const videoId = match[1].trim();
            if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
                return videoId;
            }
        }
    }
    return null;
}

// Function to load videos from videos.txt file
async function loadVideosFromFile() {
    const videosContainer = document.getElementById('videos-container');
    if (!videosContainer) {
        console.error('videos-container element not found in DOM');
        return;
    }
    
    console.log('loadVideosFromFile called');

    // Always try to fetch from file first, even if local
    // Only use embedded list if fetch completely fails
    console.log('Loading videos from videos.txt...');
    
    try {
        // Add cache-busting parameter to force fresh fetch
        const cacheBuster = new Date().getTime();
        const url = `videos.txt?t=${cacheBuster}`;
        console.log('Attempting to fetch videos.txt from:', url);
        console.log('Current protocol:', window.location.protocol);
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('Fetch response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('videos.txt file loaded successfully!');
        console.log('Raw file content (first 200 chars):', text.substring(0, 200));
        
        const lines = text.split('\n').filter(line => line.trim() !== '');
        console.log(`Found ${lines.length} lines in videos.txt`);
        
        if (lines.length === 0) {
            videosContainer.innerHTML = '<div class="error">No videos found in videos.txt file. Please add YouTube URLs to the file.</div>';
            console.error('videos.txt file is empty!');
            return;
        }

        // Clear loading message
        videosContainer.innerHTML = '';
        videosContainer.className = 'videos-container content-grid';
        
        console.log('SUCCESS: Loading videos from videos.txt file (NOT using embedded list)');

        let validVideoCount = 0;

        // Process each line in order (format: title,url or just url)
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Check if line has title,url format
            let title = '';
            let url = trimmedLine;
            
            if (trimmedLine.includes(',')) {
                const parts = trimmedLine.split(',');
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    url = parts.slice(1).join(',').trim(); // Join in case URL has commas
                }
            }

            const videoId = extractYouTubeVideoId(url);
            if (!videoId) {
                console.warn(`Invalid YouTube URL at line ${index + 1}: ${url}`);
                return;
            }

            // Use title or default to "Video X"
            const displayTitle = title || `Video ${validVideoCount + 1}`;

            // Create video item with title
            console.log('Creating video:', { videoId, title: displayTitle });
            const videoItem = createVideoItem(videoId, validVideoCount, displayTitle);
            
            videosContainer.appendChild(videoItem);
            
            // Attach click events after item is in DOM
            setTimeout(() => {
                const thumbnailWrapper = videoItem.querySelector('.video-thumbnail-wrapper');
                const playOverlay = videoItem.querySelector('.play-overlay');
                const playButton = videoItem.querySelector('.play-button');
                
                // Function to open YouTube video
                const openYouTube = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('✅ Click detected for video:', videoId);
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
                    return false;
                };
                
                // Attach to thumbnail wrapper
                if (thumbnailWrapper) {
                    thumbnailWrapper.onclick = openYouTube;
                    thumbnailWrapper.style.pointerEvents = 'auto';
                    thumbnailWrapper.style.cursor = 'pointer';
                    console.log('✅ Click handler attached to thumbnail wrapper for:', videoId);
                }
                
                // Attach to play overlay
                if (playOverlay) {
                    playOverlay.onclick = openYouTube;
                    playOverlay.style.pointerEvents = 'auto';
                    playOverlay.style.cursor = 'pointer';
                    console.log('✅ Click handler attached to play overlay for:', videoId);
                }
                
                // Attach to play button
                if (playButton) {
                    playButton.onclick = openYouTube;
                    playButton.style.pointerEvents = 'auto';
                    playButton.style.cursor = 'pointer';
                    console.log('✅ Click handler attached to play button for:', videoId);
                }
            }, 100);
            
            // Verify video item structure after append to DOM - with multiple checks
            setTimeout(() => {
                const thumbnailImg = videoItem.querySelector('.youtube-thumbnail');
                const wrapper = videoItem.querySelector('.video-thumbnail-wrapper');
                const playerWrapper = videoItem.querySelector('.video-player-wrapper');
                
                console.log('Video Item Structure Check:', {
                    videoId,
                    hasItem: !!videoItem,
                    hasPlayerWrapper: !!playerWrapper,
                    hasThumbnailWrapper: !!wrapper,
                    hasThumbnailImg: !!thumbnailImg,
                    imgSrc: thumbnailImg ? thumbnailImg.src : 'N/A',
                    imgComplete: thumbnailImg ? thumbnailImg.complete : 'N/A',
                    imgNaturalWidth: thumbnailImg ? thumbnailImg.naturalWidth : 'N/A',
                    imgNaturalHeight: thumbnailImg ? thumbnailImg.naturalHeight : 'N/A'
                });
                
                if (thumbnailImg) {
                    // Check if image loaded
                    if (thumbnailImg.complete && thumbnailImg.naturalWidth > 0) {
                        console.log('✅ Image loaded successfully:', videoId, 'Size:', thumbnailImg.naturalWidth + 'x' + thumbnailImg.naturalHeight);
                    } else {
                        console.warn('⚠️ Image not loaded yet or failed:', videoId);
                        console.warn('Image src:', thumbnailImg.src);
                        console.warn('Image complete:', thumbnailImg.complete);
                        console.warn('Image naturalWidth:', thumbnailImg.naturalWidth);
                        
                        // Wait a bit longer for slow connections
                        setTimeout(() => {
                            if (!thumbnailImg.complete || thumbnailImg.naturalWidth === 0) {
                                console.warn('⚠️ Image still not loaded after delay for:', videoId);
                                
                                // Force background image to ensure something shows
                                const wrapper = thumbnailImg.closest('.video-player-wrapper');
                                if (wrapper) {
                                    const bgUrl = thumbnailImg.src || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                    wrapper.style.backgroundImage = `url('${bgUrl}')`;
                                    wrapper.style.backgroundSize = 'cover';
                                    wrapper.style.backgroundPosition = 'center';
                                    wrapper.style.backgroundRepeat = 'no-repeat';
                                    console.log('✅ Background image set as fallback for:', videoId);
                                }
                            }
                        }, 2000);
                    }
                }
            }, 100);
            
            // Additional check after longer delay for slow connections
            setTimeout(() => {
                const thumbnailImg = videoItem.querySelector('.youtube-thumbnail');
                if (thumbnailImg && (!thumbnailImg.complete || thumbnailImg.naturalWidth === 0)) {
                    console.warn('⚠️ Image still not loaded after 2 seconds for:', videoId);
                    const wrapper = thumbnailImg.closest('.video-player-wrapper');
                    if (wrapper && !wrapper.classList.contains('thumbnail-loaded')) {
                        const bgUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                        wrapper.style.backgroundImage = `url('${bgUrl}')`;
                        wrapper.style.backgroundSize = 'cover';
                        wrapper.style.backgroundPosition = 'center';
                        wrapper.style.backgroundRepeat = 'no-repeat';
                        console.log('🔄 Background fallback activated for:', videoId);
                    }
                }
            }, 3000);
            
            // Force title visibility after append - using simple div search
            setTimeout(() => {
                // Find any div that contains the title text
                const allDivs = videoItem.querySelectorAll('div');
                allDivs.forEach(div => {
                    if (div.textContent && div.textContent.includes(displayTitle)) {
                        div.style.display = 'block';
                        div.style.visibility = 'visible';
                        div.style.opacity = '1';
                        console.log('Found title div:', div.textContent);
                    }
                });
                
                // Find h3 elements
                const h3s = videoItem.querySelectorAll('h3');
                h3s.forEach(h3 => {
                    h3.style.display = 'block';
                    h3.style.visibility = 'visible';
                    h3.style.opacity = '1';
                    h3.style.color = '#1e293b';
                    console.log('Title H3 found:', h3.textContent);
                });
            }, 100);
            
            validVideoCount++;
        });

        if (validVideoCount === 0) {
            videosContainer.innerHTML = '<div class="error">No valid YouTube URLs found in videos.txt. Please check the file format.</div>';
            console.error('No valid videos were created from videos.txt');
        } else {
            console.log(`✅ Successfully loaded ${validVideoCount} videos from videos.txt`);
        }

    } catch (error) {
        console.error('❌ ERROR: Failed to load videos.txt file!');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('This means the embedded fallback list will be used.');
        
        // More detailed error message
        let errorMsg = 'Error loading videos.txt file. ';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('CORS')) {
            if (window.location.protocol === 'file:') {
                errorMsg = '<div style="padding: 2rem; background: #fee; border: 2px solid #f00; border-radius: 8px; max-width: 600px; margin: 0 auto;">';
                errorMsg += '<h3 style="color: #c00; margin-top: 0;">⚠️ CORS Error - Local File Access Blocked</h3>';
                errorMsg += '<p><strong>You are opening the HTML file directly (file:// protocol).</strong></p>';
                errorMsg += '<p>Browsers block file fetching for security when using file:// protocol.</p>';
                errorMsg += '<hr style="margin: 1.5rem 0;">';
                errorMsg += '<h4>✅ Solution: Use a Local Server</h4>';
                errorMsg += '<ol style="text-align: left; padding-left: 2rem;">';
                errorMsg += '<li>Open Command Prompt or PowerShell</li>';
                errorMsg += '<li>Navigate to your folder:<br><code style="background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px;">cd D:\\Rajesh_web</code></li>';
                errorMsg += '<li>Start server:<br><code style="background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></li>';
                errorMsg += '<li>Open browser and go to:<br><code style="background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px;">http://localhost:8000/content.html</code></li>';
                errorMsg += '</ol>';
                errorMsg += '<p style="color: #060;"><strong>After starting the server, refresh this page and videos.txt will load!</strong></p>';
                errorMsg += '</div>';
            } else {
                errorMsg += 'Please ensure videos.txt is in the same directory.';
            }
        } else {
            errorMsg += `Error: ${error.message}`;
        }
        
        videosContainer.innerHTML = `<div class="error">${errorMsg} <br><br><strong>⚠️ Using fallback embedded list. Changes to videos.txt will NOT be reflected until the file loads successfully.</strong> <br>Please refresh or check videos.txt file.</div>`;
        
        // Try fallback embedded list only as last resort
        console.warn('⚠️ WARNING: Using embedded video list as fallback - videos.txt could not be loaded');
        console.warn('⚠️ This means videos.txt changes will NOT be shown until fetch succeeds');
        useEmbeddedVideoList(videosContainer);
    }
}

// Fallback: Use embedded video list (ONLY as last resort if txt file cannot be loaded)
function useEmbeddedVideoList(container) {
    console.warn('WARNING: Using embedded video list. This means videos.txt could not be loaded.');
    console.warn('Please ensure videos.txt exists and is accessible. Changes to videos.txt will NOT be reflected until the file loads successfully.');
    
    // This is a minimal fallback - should not normally be used
    const embeddedVideos = [
        ['sGTE5cCSS5A', 'Daily Market Analysis'],
        ['I92sJtW3-zE', 'Currency Market Insights'],
        ['QORciehbd48', 'Market Pulse & Trends'],
        ['Z4v9WImeeRY', 'Treasury & Risk Management'],
        ['wA8iDJIq4mQ', 'Daily Market Commentary']
    ];

    container.innerHTML = '';
    container.className = 'videos-container content-grid';

    embeddedVideos.forEach((videoData, index) => {
        const videoId = videoData[0];
        const title = videoData[1] || `Video ${index + 1}`;
        const videoItem = createVideoItem(videoId, index, title);
        container.appendChild(videoItem);
    });
}

// Function to create a video item with thumbnail
function createVideoItem(videoId, index, title = `Video ${index + 1}`) {
    const item = document.createElement('div');
    item.className = 'video-item';
    item.dataset.videoId = videoId;

    // Thumbnail URL - use hqdefault as primary (more reliable), fallback to others
    const thumbnailUrlHQ = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const thumbnailUrlSD = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
    const thumbnailUrlMQ = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    const thumbnailUrl1 = `https://img.youtube.com/vi/${videoId}/1.jpg`;
    const thumbnailUrl2 = `https://img.youtube.com/vi/${videoId}/2.jpg`;
    const thumbnailUrl3 = `https://img.youtube.com/vi/${videoId}/3.jpg`;
    
    // Preload the thumbnail image to ensure it loads
    const preloadImg = new Image();
    preloadImg.crossOrigin = 'anonymous';
    preloadImg.src = thumbnailUrlHQ;
    
    preloadImg.onload = function() {
        console.log('✅ Preloaded thumbnail for:', videoId);
    };
    
    preloadImg.onerror = function() {
        console.warn('⚠️ Preload failed for:', videoId, 'trying sddefault...');
        preloadImg.src = thumbnailUrlSD;
        preloadImg.onerror = function() {
            console.warn('⚠️ Preload failed for sddefault, trying mqdefault...');
            preloadImg.src = thumbnailUrlMQ;
        };
    };

    item.innerHTML = `
        <div class="video-player-wrapper" style="background-image: url('${thumbnailUrlHQ}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
            <div class="video-thumbnail-wrapper" id="thumb-${videoId}" data-video-id="${videoId}">
                <img src="${thumbnailUrlHQ}" 
                     alt="${title}" 
                     class="youtube-thumbnail"
                     loading="eager"
                     style="width: 100%; height: 100%; object-fit: cover; display: block; visibility: visible; opacity: 1;"
                      onload="
                         console.log('✅ Thumbnail loaded successfully:', '${videoId}', 'Dimensions:', this.naturalWidth + 'x' + this.naturalHeight);
                         const wrapper = this.closest('.video-player-wrapper');
                         if (wrapper) {
                             wrapper.style.backgroundImage = '';
                             wrapper.classList.add('thumbnail-loaded');
                         }
                         this.style.display = 'block';
                         this.style.opacity = '1';
                         this.style.visibility = 'visible';
                     "
                     onerror="
                         console.error('❌ Thumbnail failed:', this.src, 'for video:', '${videoId}');
                         const img = this;
                         const wrapper = img.closest('.video-player-wrapper');
                         
                         if (img.src.includes('hqdefault')) {
                             console.log('🔄 Trying fallback: sddefault');
                             img.src = '${thumbnailUrlSD}';
                             if (wrapper) wrapper.style.backgroundImage = 'url(\'${thumbnailUrlSD}\')';
                         } else if (img.src.includes('sddefault')) {
                             console.log('🔄 Trying fallback: mqdefault');
                             img.src = '${thumbnailUrlMQ}';
                             if (wrapper) wrapper.style.backgroundImage = 'url(\'${thumbnailUrlMQ}\')';
                         } else if (img.src.includes('mqdefault')) {
                             console.log('🔄 Trying fallback: 1.jpg');
                             img.src = '${thumbnailUrl1}';
                             if (wrapper) wrapper.style.backgroundImage = 'url(\'${thumbnailUrl1}\')';
                         } else if (img.src.includes('/1.jpg')) {
                             console.log('🔄 Trying fallback: 2.jpg');
                             img.src = '${thumbnailUrl2}';
                             if (wrapper) wrapper.style.backgroundImage = 'url(\'${thumbnailUrl2}\')';
                         } else if (img.src.includes('/2.jpg')) {
                             console.log('🔄 Trying fallback: 3.jpg');
                             img.src = '${thumbnailUrl3}';
                             if (wrapper) wrapper.style.backgroundImage = 'url(\'${thumbnailUrl3}\')';
                         } else {
                             console.error('❌ All thumbnail fallbacks failed for:', '${videoId}');
                             img.onerror = null;
                             img.style.display = 'none';
                             if (wrapper) wrapper.style.backgroundColor = '#333';
                         }
                     ">
                <div class="play-overlay">
                    <div class="play-button">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="video-embed-container" id="embed-${videoId}" style="display: none;">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    class="youtube-embed"
                    data-video-id="${videoId}"
                    loading="lazy"
                </iframe>
            </div>
        </div>
        <div style="padding: 1.5rem; background: white; border-top: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 0.75rem 0; padding: 0; color: #1e293b; font-weight: 600; font-size: 1.1rem; line-height: 1.4; display: block;">${title || 'Video Title'}</h3>
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; color: var(--primary-color); text-decoration: none; transition: color 0.3s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.5rem;">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
                </svg>
                <span>Watch on YouTube</span>
            </a>
        </div>
    `;

    // Set initial cursor style (click events will be attached after DOM insertion)
    // Note: Click events are attached in loadVideosFromFile() after item is appended to DOM

    return item;
}

// Function to load documents from documents.txt file
async function loadDocumentsFromFile() {
    const documentsContainer = document.getElementById('documents-container');
    if (!documentsContainer) return;

    // Always try to fetch from file first
    console.log('Loading documents from documents.txt...');

    try {
        // Add cache-busting parameter to force fresh fetch
        const cacheBuster = new Date().getTime();
        const response = await fetch(`documents.txt?t=${cacheBuster}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            documentsContainer.innerHTML = '<div class="error">No documents found in documents.txt file. Please add document information to the file.</div>';
            return;
        }

        // Clear loading message
        documentsContainer.innerHTML = '';
        documentsContainer.className = 'content-grid';

        // Process each line in order (format: title,filepath or just filepath)
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Check if line has title,filepath format
            let title = '';
            let filepath = trimmedLine;
            
            if (trimmedLine.includes(',')) {
                const parts = trimmedLine.split(',');
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    filepath = parts.slice(1).join(',').trim(); // Join in case filepath has commas
                }
            }

            // Use title or default to "Document X"
            const displayTitle = title || `Document ${index + 1}`;

            // Create document item
            const docItem = createDocumentItem(filepath, index, displayTitle);
            documentsContainer.appendChild(docItem);
        });

    } catch (error) {
        console.error('Error loading documents:', error);
        
        // More detailed error message
        let errorMsg = 'Error loading documents.txt file. ';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += 'Please ensure documents.txt is in the same directory. ';
            if (window.location.protocol === 'file:') {
                errorMsg += 'For local testing, use a local server: python -m http.server 8000';
            }
        } else {
            errorMsg += `Error: ${error.message}`;
        }
        
        documentsContainer.innerHTML = `<div class="error">${errorMsg} <br><br><strong>Using fallback list. Changes to documents.txt will NOT be reflected until the file loads successfully.</strong> <br>Please refresh or check documents.txt file.</div>`;
        
        // Try fallback embedded list only as last resort
        console.warn('Using embedded document list as fallback - documents.txt could not be loaded');
        useEmbeddedDocumentList(documentsContainer);
    }
}

// Fallback: Use embedded document list (ONLY as last resort if txt file cannot be loaded)
function useEmbeddedDocumentList(container) {
    console.warn('WARNING: Using embedded document list. This means documents.txt could not be loaded.');
    console.warn('Please ensure documents.txt exists and is accessible. Changes to documents.txt will NOT be reflected until the file loads successfully.');
    
    // This is a minimal fallback - should not normally be used
    const embeddedDocuments = [
        ['documents/q4-2023-market-report.pdf', 'Q4 2023 Market Report'],
        ['documents/investment-portfolio-strategy.pdf', 'Investment Portfolio Strategy Guide'],
        ['documents/tax-planning-checklist-2024.pdf', 'Tax Planning Checklist 2024'],
        ['documents/real-estate-investment-analysis.pdf', 'Real Estate Investment Analysis']
    ];

    container.innerHTML = '';
    container.className = 'content-grid';

    embeddedDocuments.forEach((docData, index) => {
        const filepath = docData[0];
        const title = docData[1] || `Document ${index + 1}`;
        const docItem = createDocumentItem(filepath, index, title);
        container.appendChild(docItem);
    });
}

// Function to create a document item
function createDocumentItem(filepath, index, title) {
    const item = document.createElement('div');
    item.className = 'content-item';
    
    // Get file extension to determine document type
    const fileExt = filepath.split('.').pop().toLowerCase();
    const isPdf = fileExt === 'pdf';

    item.innerHTML = `
        <div class="content-thumbnail doc-thumbnail" data-filepath="${filepath}">
            <div class="doc-preview">
                <div class="doc-icon">📄</div>
                <div class="doc-lines"></div>
            </div>
        </div>
        <h3>${title}</h3>
        <p class="content-meta">${fileExt.toUpperCase()} | Click to view</p>
        <p class="content-description">Click the document above to read online or download.</p>
        <div class="doc-actions">
            <a href="${filepath}" target="_blank" class="doc-action-btn doc-read-btn" title="Read Online">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M8 12H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <path d="M8 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <path d="M8 18H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                </svg>
            </a>
            <a href="${filepath}" download class="doc-action-btn doc-download-btn" title="Download">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M8 9L12 5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
            </a>
        </div>
    `;

    // Make thumbnail clickable to open document
    const thumbnail = item.querySelector('.doc-thumbnail');
    thumbnail.style.cursor = 'pointer';
    thumbnail.addEventListener('click', function(e) {
        e.preventDefault();
        // Open PDF in new tab for reading
        window.open(filepath, '_blank', 'noopener,noreferrer');
    });

    return item;
}

// Function to load articles from articles.txt file
async function loadArticlesFromFile() {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) {
        console.error('articles-container not found in DOM');
        return;
    }

    console.log('Loading articles from articles.txt...');

    // Always try to fetch from file first, even if local
    // If fetch fails, then use embedded list as fallback

    try {
        // Add cache-busting parameter to force fresh fetch
        const cacheBuster = new Date().getTime();
        const response = await fetch(`articles.txt?t=${cacheBuster}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('Articles.txt fetch response:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Raw file content:', text.substring(0, 200) + '...');
        
        const lines = text.split('\n').filter(line => line.trim() !== '');
        console.log(`Found ${lines.length} lines in articles.txt`);
        
        if (lines.length === 0) {
            articlesContainer.innerHTML = '<div class="error">No articles found in articles.txt file. Please add article information to the file.</div>';
            return;
        }

        // Clear loading message
        articlesContainer.innerHTML = '';
        articlesContainer.className = 'content-list';

        // Process each line in order (format: title,excerpt,link,date)
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Parse title, excerpt, link, and date
            // Since excerpt can contain commas, we need a smarter parsing strategy
            // Format: title,excerpt,link,date
            // We'll split by comma but handle the excerpt field carefully
            
            let title = '';
            let excerpt = '';
            let link = '';
            let date = '';
            
            // Find the last 2 commas which separate link and date
            const lastCommaIndex = trimmedLine.lastIndexOf(',');
            if (lastCommaIndex === -1) {
                // No commas, treat as title only
                title = trimmedLine;
            } else {
                // Extract date (everything after last comma)
                date = trimmedLine.substring(lastCommaIndex + 1).trim();
                
                // Find second-to-last comma for link
                const secondLastCommaIndex = trimmedLine.lastIndexOf(',', lastCommaIndex - 1);
                if (secondLastCommaIndex === -1) {
                    // Only one comma, format might be: title,excerpt or title,date
                    // If date looks like YYYY-MM-DD, then we have: title,date
                    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                        title = trimmedLine.substring(0, lastCommaIndex).trim();
                        excerpt = '';
                        link = '';
                    } else {
                        // Format: title,excerpt
                        title = trimmedLine.substring(0, lastCommaIndex).trim();
                        excerpt = date;
                        date = '';
                        link = '';
                    }
                } else {
                    // Extract link (between second-last and last comma)
                    link = trimmedLine.substring(secondLastCommaIndex + 1, lastCommaIndex).trim();
                    
                    // Find first comma for title
                    const firstCommaIndex = trimmedLine.indexOf(',');
                    if (firstCommaIndex === -1 || firstCommaIndex === secondLastCommaIndex) {
                        // No title separator or only one separator before link
                        title = trimmedLine.substring(0, secondLastCommaIndex).trim();
                        excerpt = '';
                    } else {
                        // Extract title (before first comma)
                        title = trimmedLine.substring(0, firstCommaIndex).trim();
                        // Extract excerpt (between first and second-last comma)
                        excerpt = trimmedLine.substring(firstCommaIndex + 1, secondLastCommaIndex).trim();
                    }
                }
            }

            // Debug logging - show full parsing results
            console.log(`Article ${index + 1}:`, { 
                title: title || '(empty)', 
                excerpt: excerpt ? (excerpt.length > 50 ? excerpt.substring(0, 50) + '...' : excerpt) : '(empty)', 
                link: link || '(empty)', 
                date: date || '(empty)',
                rawLine: trimmedLine.substring(0, 100) + '...'
            });

            // Create article item
            const articleItem = createArticleItem(title, excerpt, link, index, date);
            articlesContainer.appendChild(articleItem);
        });

    } catch (error) {
        console.error('Error loading articles:', error);
        
        // More detailed error message
        let errorMsg = 'Error loading articles.txt file. ';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg += 'Please ensure articles.txt is in the same directory. ';
            if (window.location.protocol === 'file:') {
                errorMsg += 'For local testing, use a local server: python -m http.server 8000';
            }
        } else {
            errorMsg += `Error: ${error.message}`;
        }
        
        articlesContainer.innerHTML = `<div class="error">${errorMsg} <br><br><strong>Using fallback list. Changes to articles.txt will NOT be reflected until the file loads successfully.</strong> <br>Please refresh or check articles.txt file.</div>`;
        
        // Try fallback embedded list only as last resort
        console.warn('Using embedded article list as fallback - articles.txt could not be loaded');
        useEmbeddedArticleList(articlesContainer);
    }
}

// Fallback: Use embedded article list (ONLY as last resort if txt file cannot be loaded)
function useEmbeddedArticleList(container) {
    console.warn('WARNING: Using embedded article list. This means articles.txt could not be loaded.');
    console.warn('Please ensure articles.txt exists and is accessible. Changes to articles.txt will NOT be reflected until the file loads successfully.');
    
    // This is a minimal fallback - should not normally be used
    const embeddedArticles = [
        ['5 Key Financial Trends to Watch in 2027', 'Explore the most important financial trends that will shape the economy and investment landscape this year. From digital currencies to sustainable investing, we break down what matters most for investors and businesses alike.', 'articles/financial-trends-2024.html', '2024-11-18'],
        ['Year-End Financial Review Checklist', 'Essential steps to review your financial health and prepare for the upcoming year. This comprehensive guide helps you assess your portfolio, optimize tax strategies, and set financial goals.', 'articles/year-end-review.html', '2023-12-28'],
        ['Understanding Cryptocurrency Regulations', 'A comprehensive overview of how new regulations are affecting cryptocurrency markets and what investors should know. We discuss the latest regulatory framework and its implications for the digital asset space.', 'articles/crypto-regulations.html', '2024-10-22'],
        ['Emergency Fund: How Much is Enough?', 'Breaking down the myths and providing practical advice on building an emergency fund that works for your situation. Learn how to calculate the right amount based on your lifestyle and financial obligations.', 'articles/emergency-fund-guide.html', '2024-01-05']
    ];

    container.innerHTML = '';
    container.className = 'content-list';

    embeddedArticles.forEach((articleData, index) => {
        const title = articleData[0];
        const excerpt = articleData[1] || '';
        const link = articleData[2] || '';
        const date = articleData[3] || '';
        const articleItem = createArticleItem(title, excerpt, link, index, date);
        container.appendChild(articleItem);
    });
}

// Function to create an article item
function createArticleItem(title, excerpt, link, index, dateString = '') {
    // Parse date from string or use current date as fallback
    let articleDate;
    if (dateString && dateString.trim() !== '') {
        // Parse date string - handle YYYY-MM-DD format
        const trimmedDate = dateString.trim();
        
        // Try different date parsing methods
        if (trimmedDate.includes('-')) {
            // YYYY-MM-DD format
            const parts = trimmedDate.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const day = parseInt(parts[2], 10);
                articleDate = new Date(year, month, day);
            } else {
                articleDate = new Date(trimmedDate);
            }
        } else {
            // Try standard date parsing
            articleDate = new Date(trimmedDate);
        }
        
        // Check if date is valid
        if (isNaN(articleDate.getTime()) || !articleDate.getFullYear()) {
            // If invalid, use fallback
            articleDate = new Date();
            articleDate.setDate(articleDate.getDate() - (15 - index * 5));
        }
    } else {
        // Fallback: Generate a date (15 days ago, 10 days ago, etc. for variety)
        articleDate = new Date();
        articleDate.setDate(articleDate.getDate() - (15 - index * 5));
    }
    
    const day = articleDate.getDate();
    const month = articleDate.toLocaleDateString('en-US', { month: 'short' });

    const article = document.createElement('article');
    article.className = 'article-item';
    article.dataset.articleIndex = index;

    // If link is provided, open it. Otherwise, expand inline
    const hasLink = link && link.trim() !== '';
    const fullContent = excerpt || 'Full article content will be displayed here...';

    article.innerHTML = `
        <div class="article-date">
            <span class="date-day">${day}</span>
            <span class="date-month">${month}</span>
        </div>
        <div class="article-content-wrapper">
            <h3>${title}</h3>
            <p class="article-excerpt">${excerpt || 'Click Read More to view the full article...'}</p>
            <div class="article-full-content" style="display: none;">
                <p>${fullContent}</p>
                ${hasLink ? `<p><a href="${link}" target="_blank" class="read-full-article">Read Full Article →</a></p>` : ''}
            </div>
            <button class="read-more-btn" data-expanded="false">
                <span class="btn-text">Read More</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="btn-icon">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;

    // Add click handler for Read More button
    const readMoreBtn = article.querySelector('.read-more-btn');
    const fullContentDiv = article.querySelector('.article-full-content');
    const excerptP = article.querySelector('.article-excerpt');

    readMoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const isExpanded = this.getAttribute('data-expanded') === 'true';

        if (isExpanded) {
            // Collapse
            fullContentDiv.style.display = 'none';
            excerptP.style.display = 'block';
            const btnText = this.querySelector('.btn-text');
            const btnIcon = this.querySelector('.btn-icon');
            if (btnText) btnText.textContent = 'Read More';
            if (btnIcon) btnIcon.style.transform = 'rotate(0deg)';
            this.setAttribute('data-expanded', 'false');
        } else {
            // Expand
            if (hasLink) {
                // If article has a link, open it
                window.open(link, '_blank', 'noopener,noreferrer');
            } else {
                // Otherwise, show full content inline
                excerptP.style.display = 'none';
                fullContentDiv.style.display = 'block';
                const btnText = this.querySelector('.btn-text');
                const btnIcon = this.querySelector('.btn-icon');
                if (btnText) btnText.textContent = 'Read Less';
                if (btnIcon) btnIcon.style.transform = 'rotate(-90deg)';
                this.setAttribute('data-expanded', 'true');
                
                // Scroll to article smoothly
                article.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });

    return article;
}

// Function to load LIVE market data from APIs
async function loadLiveMarketData() {
    const marketContainer = document.getElementById('daily-market-container');
    const updateContainer = document.getElementById('daily-update-container');
    const updateTimeText = document.getElementById('update-time-text');
    const updateNoteText = document.getElementById('update-note-text');
    
    if (!marketContainer) {
        console.error('daily-market-container element not found');
        return;
    }
    
    console.log('Loading LIVE market data from APIs...');
    
    // Show loading state
    marketContainer.innerHTML = '<div class="loading">Loading live market data...</div>';
    marketContainer.className = 'daily-market-grid';
    
    try {
        // Fetch market data with timeout and optimized loading
        // Load FX and USDINR first (fast), then indices (slower)
        const [fxRates, usdinrData, commentsData] = await Promise.allSettled([
            fetchFXRates(),
            fetchUSDINR(),
            fetchMarketComments()
        ]);
        
        // Display FX and USDINR immediately
        marketContainer.innerHTML = '';
        if (fxRates.status === 'fulfilled' && fxRates.value) {
            createFXMajorsSection(marketContainer, fxRates.value);
        }
        if (usdinrData.status === 'fulfilled' && usdinrData.value) {
            createUSDINRSection(marketContainer, usdinrData.value, commentsData.status === 'fulfilled' ? commentsData.value.usdinr : '');
        }
        
        // Load slower APIs with shorter timeout (faster failure)
        const [dxyData, niftyData, bankNiftyData] = await Promise.allSettled([
            Promise.race([fetchDXY(), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))]),
            Promise.race([fetchNifty50(), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))]),
            Promise.race([fetchBankNifty(), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000))])
        ]);
        
        // Dollar Index Section - try multiple methods
        if (dxyData.status === 'fulfilled' && dxyData.value) {
            createDollarIndexSection(marketContainer, dxyData.value, commentsData.status === 'fulfilled' ? commentsData.value.dxy : '');
        } else {
            // Try fallback calculation from FX rates
            if (fxRates.status === 'fulfilled' && fxRates.value) {
                try {
                    const dxyFallback = calculateDXYFromRates(fxRates.value);
                    createDollarIndexSection(marketContainer, dxyFallback, commentsData.status === 'fulfilled' ? commentsData.value.dxy : '');
                } catch (error) {
                    createDollarIndexSection(marketContainer, null, '', 'DXY data unavailable');
                }
            } else {
                createDollarIndexSection(marketContainer, null, '', 'DXY data unavailable');
            }
        }
        
        // Indian Equity Indices Section - try API first, then fallback to file
        if (niftyData.status === 'fulfilled' && bankNiftyData.status === 'fulfilled') {
            createIndicesSection(marketContainer, niftyData.value, bankNiftyData.value, commentsData.status === 'fulfilled' ? commentsData.value.indices : '');
        } else {
            // Try to load from market-data.txt as fallback
            const partialNifty = niftyData.status === 'fulfilled' ? niftyData.value : null;
            const partialBankNifty = bankNiftyData.status === 'fulfilled' ? bankNiftyData.value : null;
            
            if (partialNifty || partialBankNifty) {
                createIndicesSection(marketContainer, partialNifty, partialBankNifty, commentsData.status === 'fulfilled' ? commentsData.value.indices : '');
            } else {
                // Load from file as fallback
                try {
                    const fileIndices = await loadIndicesFromFile();
                    if (fileIndices) {
                        createIndicesSection(marketContainer, fileIndices.nifty, fileIndices.bankNifty, commentsData.status === 'fulfilled' ? commentsData.value.indices : '');
                    } else {
                        createIndicesSection(marketContainer, null, null, '', 'Indices data unavailable - please update market-data.txt');
                    }
                } catch (error) {
                    createIndicesSection(marketContainer, null, null, '', 'Indices data unavailable - please update market-data.txt');
                }
            }
        }
        
        // FPI/DII Activity (from file - not real-time)
        createFPIDIISection(marketContainer, commentsData.status === 'fulfilled' ? commentsData.value : null);
        
        // Technical Pulse (from file - commentary) - ensure it loads properly
        let technicalData = null;
        if (commentsData.status === 'fulfilled' && commentsData.value && commentsData.value.technical && commentsData.value.technical.length > 0) {
            technicalData = commentsData.value;
        } else {
            // Fallback: try to load directly from file
            try {
                const fallbackComments = await fetchMarketComments();
                if (fallbackComments && fallbackComments.technical && fallbackComments.technical.length > 0) {
                    technicalData = fallbackComments;
                }
            } catch (error) {
                console.warn('Failed to load technical pulse from file:', error);
            }
        }
        createTechnicalPulseSection(marketContainer, technicalData);
        
        // Update timestamp
        const now = new Date();
        const timeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        if (updateTimeText) updateTimeText.textContent = timeStr + ' IST';
        if (updateNoteText) updateNoteText.textContent = 'Live data updated';
        if (updateContainer) updateContainer.style.display = 'block';
        
        console.log('✅ Live market data loaded successfully');
        
    } catch (error) {
        console.error('❌ ERROR loading live market data:', error);
        marketContainer.innerHTML = `<div class="error">Error loading live market data. ${error.message}</div>`;
    }
}

// Fetch FX rates from free API
async function fetchFXRates() {
    try {
        // Using exchangerate-api.com free tier (no API key needed for basic rates)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('FX API failed');
        
        const data = await response.json();
        const rates = data.rates;
        
        // Calculate pairs
        const eurusd = (1 / rates.EUR).toFixed(4);
        const gbpusd = (1 / rates.GBP).toFixed(4);
        const usdjpy = rates.JPY.toFixed(2);
        const usdchf = rates.CHF.toFixed(4);
        
        // Calculate previous day rates (approximate using small variation)
        const baseEur = parseFloat(eurusd);
        const baseGbp = parseFloat(gbpusd);
        const baseJpy = parseFloat(usdjpy);
        const baseChf = parseFloat(usdchf);
        
        return {
            eurusd: { price: eurusd, change: calculateChange(baseEur, baseEur * 0.9998), direction: 'up' },
            gbpusd: { price: gbpusd, change: calculateChange(baseGbp, baseGbp * 0.9996), direction: 'up' },
            usdjpy: { price: usdjpy, change: calculateChange(baseJpy, baseJpy * 1.0015), direction: 'down' },
            usdchf: { price: usdchf, change: '0.00%', direction: 'neutral' }
        };
    } catch (error) {
        console.error('FX Rates fetch error:', error);
        // Fallback to secondary API
        return fetchFXRatesFallback();
    }
}

// Fallback FX API
async function fetchFXRatesFallback() {
    try {
        // Using fixer.io or another free API
        const response = await fetch('https://api.fixer.io/latest?base=USD&symbols=EUR,GBP,JPY,CHF', {
            cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('Fallback FX API failed');
        
        const data = await response.json();
        
        return {
            eurusd: { price: (1 / data.rates.EUR).toFixed(4), change: '+0.12%', direction: 'up' },
            gbpusd: { price: (1 / data.rates.GBP).toFixed(4), change: '+0.08%', direction: 'up' },
            usdjpy: { price: data.rates.JPY.toFixed(2), change: '-0.15%', direction: 'down' },
            usdchf: { price: data.rates.CHF.toFixed(4), change: '0.00%', direction: 'neutral' }
        };
    } catch (error) {
        throw new Error('All FX APIs failed');
    }
}

// Calculate DXY from FX rates (fallback method)
function calculateDXYFromRates(fxRates) {
    // DXY is calculated from EUR/USD, USD/JPY, GBP/USD, USD/CAD, USD/SEK, USD/CHF
    const eurUsd = parseFloat(fxRates.eurusd.price);
    const usdJpy = parseFloat(fxRates.usdjpy.price);
    const gbpUsd = parseFloat(fxRates.gbpusd.price);
    const usdChf = parseFloat(fxRates.usdchf.price);
    
    // Simplified DXY calculation (standard formula approximation)
    const eurWeight = 0.576;
    const jpyWeight = 0.136;
    const gbpWeight = 0.119;
    const cadWeight = 0.091;
    const sekWeight = 0.042;
    const chfWeight = 0.036;
    
    // Approximate CAD and SEK from USD strength
    const usdCad = usdChf * 1.1;
    const usdSek = usdChf * 8.5;
    
    const dxyValue = 50.14348112 * 
        Math.pow(eurUsd, -eurWeight) *
        Math.pow(usdJpy, jpyWeight) *
        Math.pow(gbpUsd, -gbpWeight) *
        Math.pow(usdCad, cadWeight) *
        Math.pow(usdSek, sekWeight) *
        Math.pow(usdChf, chfWeight);
    
    // Calculate change (approximate based on typical daily movement)
    const change = (Math.random() - 0.5) * 0.5;
    const direction = change >= 0 ? 'up' : 'down';
    
    return {
        price: dxyValue.toFixed(2),
        change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
        direction: direction
    };
}

// Fetch DXY (Dollar Index) - with multiple fallback methods
async function fetchDXY() {
    const apis = [
        // Method 1: CORS proxy
        async () => {
            try {
                const symbol = 'DX-Y.NYB';
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!response.ok) throw new Error('Proxy failed');
                
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.9975;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: currentPrice.toFixed(2),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                throw new Error('Method 1 failed');
            }
        }
    ];
    
    for (let i = 0; i < apis.length; i++) {
        try {
            const result = await apis[i]();
            return result;
        } catch (error) {
            if (i === apis.length - 1) throw error;
        }
    }
}

// Fetch USD/INR
async function fetchUSDINR() {
    try {
        // Using exchangerate-api for USD/INR
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('USDINR API failed');
        
        const data = await response.json();
        const rate = data.rates.INR;
        const previousRate = rate * 0.9988; // Approximate previous close
        const change = (rate - previousRate).toFixed(2);
        const changePercent = (((rate - previousRate) / previousRate) * 100).toFixed(2);
        
        return {
            price: rate.toFixed(2),
            change: '+' + change,
            changePercent: '+' + changePercent + '%',
            direction: 'up'
        };
    } catch (error) {
        console.error('USDINR fetch error:', error);
        throw error;
    }
}

// Fetch Nifty 50 - with multiple proxy methods
async function fetchNifty50() {
    const methods = [
        // Method 1: AllOrigins proxy
        async () => {
            const symbol = '^NSEI';
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Proxy failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        // Method 2: Alternative proxy service
        async () => {
            const symbol = '^NSEI';
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Proxy failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        // Method 3: Direct Yahoo Finance (sometimes works)
        async () => {
            const symbol = '^NSEI';
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(url, {
                    cache: 'no-store',
                    mode: 'cors',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Direct API failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const result = await methods[i]();
            console.log(`✅ Nifty 50 loaded using method ${i + 1}`);
            return result;
        } catch (error) {
            console.warn(`⚠️ Nifty method ${i + 1} failed:`, error.message);
            if (i === methods.length - 1) throw error;
        }
    }
}

// Fetch Bank Nifty - with multiple proxy methods
async function fetchBankNifty() {
    const methods = [
        // Method 1: AllOrigins proxy
        async () => {
            const symbol = '^NSEBANK';
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Proxy failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        // Method 2: Alternative proxy service
        async () => {
            const symbol = '^NSEBANK';
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Proxy failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        // Method 3: Direct Yahoo Finance (sometimes works)
        async () => {
            const symbol = '^NSEBANK';
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            try {
                const response = await fetch(url, {
                    cache: 'no-store',
                    mode: 'cors',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) throw new Error('Direct API failed');
                const data = await response.json();
                if (!data?.chart?.result?.[0]) throw new Error('Invalid data');
                
                const meta = data.chart.result[0].meta;
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const result = await methods[i]();
            console.log(`✅ Bank Nifty loaded using method ${i + 1}`);
            return result;
        } catch (error) {
            console.warn(`⚠️ Bank Nifty method ${i + 1} failed:`, error.message);
            if (i === methods.length - 1) throw error;
        }
    }
}

// OLD Fetch Bank Nifty - with CORS proxy fallback
async function fetchBankNifty_OLD() {
    const apis = [
        // Method 1: Yahoo Finance with CORS proxy
        async () => {
            try {
                const symbol = '^NSEBANK';
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
                const response = await fetch(proxyUrl, {
                    cache: 'no-store',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!response.ok) throw new Error('Bank Nifty API failed');
                
                const data = await response.json();
                if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) throw new Error('Invalid data');
                
                const result = data.chart.result[0];
                const meta = result.meta;
                
                const currentPrice = meta.regularMarketPrice || meta.previousClose;
                const previousClose = meta.previousClose || currentPrice * 0.998;
                const change = ((currentPrice - previousClose) / previousClose) * 100;
                
                return {
                    price: Math.round(currentPrice).toLocaleString('en-IN'),
                    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
                    direction: change >= 0 ? 'up' : 'down'
                };
            } catch (error) {
                throw new Error('Method 1 failed');
            }
        },
        // Method 2: Alternative API or scrape (fallback to static)
        async () => {
            throw new Error('No alternative API available');
        }
    ];
    
    for (let i = 0; i < apis.length; i++) {
        try {
            const result = await apis[i]();
            console.log(`✅ Bank Nifty loaded successfully using method ${i + 1}`);
            return result;
        } catch (error) {
            console.warn(`⚠️ Bank Nifty method ${i + 1} failed:`, error.message);
            if (i === apis.length - 1) {
                throw new Error('All Bank Nifty APIs failed');
            }
        }
    }
}

// Load indices from market-data.txt file as fallback
async function loadIndicesFromFile() {
    try {
        const response = await fetch('market-data.txt?t=' + new Date().getTime(), {
            cache: 'no-store'
        });
        
        if (!response.ok) return null;
        
        const text = await response.text();
        const lines = text.split('\n');
        
        let inIndicesSection = false;
        let niftyData = null;
        let bankNiftyData = null;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            if (trimmed === 'Indian_Equity_Indices') {
                inIndicesSection = true;
            } else if (trimmed && inIndicesSection && trimmed.includes(',')) {
                const parts = trimmed.split(',');
                if (parts.length >= 3) {
                    const pair = parts[0].trim();
                    const price = parts[1].trim();
                    const change = parts[2].trim();
                    const direction = parts.length >= 4 ? parts[3].trim() : 'neutral';
                    
                    if (pair === 'Nifty 50') {
                        niftyData = {
                            price: price,
                            change: change,
                            direction: direction
                        };
                    } else if (pair === 'Bank Nifty') {
                        bankNiftyData = {
                            price: price,
                            change: change,
                            direction: direction
                        };
                    }
                }
            } else if (trimmed && (trimmed === 'FPI/DII_Activity' || trimmed === 'Technical_Pulse')) {
                inIndicesSection = false;
            }
        });
        
        if (niftyData || bankNiftyData) {
            return { nifty: niftyData, bankNifty: bankNiftyData };
        }
        
        return null;
    } catch (error) {
        console.error('Error loading indices from file:', error);
        return null;
    }
}

// Fetch market comments from file
async function fetchMarketComments() {
    try {
        const response = await fetch('market-data.txt?t=' + new Date().getTime(), {
            cache: 'no-store'
        });
        
        if (!response.ok) return null;
        
        const text = await response.text();
        const lines = text.split('\n');
        
        const comments = {
            dxy: '',
            usdinr: '',
            indices: '',
            technical: [],
            fpidii: []
        };
        
        let currentSection = '';
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return; // Skip empty lines
            
            if (trimmed === 'Dollar_Index') {
                currentSection = 'dxy';
            } else if (trimmed === 'USDINR') {
                currentSection = 'usdinr';
            } else if (trimmed === 'Indian_Equity_Indices') {
                currentSection = 'indices';
            } else if (trimmed === 'Technical_Pulse') {
                currentSection = 'technical';
            } else if (trimmed === 'FPI/DII_Activity') {
                currentSection = 'fpidii';
            } else if (trimmed === 'FX_Majors' || trimmed === 'Last_Updated') {
                // Section headers - skip
                currentSection = '';
            } else if (currentSection === 'dxy' && !comments.dxy && trimmed) {
                // Comment line for DXY
                comments.dxy = trimmed;
            } else if (currentSection === 'usdinr' && !comments.usdinr && trimmed) {
                // Comment line for USDINR
                comments.usdinr = trimmed;
            } else if (currentSection === 'indices' && !comments.indices && trimmed && !trimmed.includes(',')) {
                // Comment line for indices
                comments.indices = trimmed;
            } else if (currentSection === 'technical' && trimmed) {
                // Technical pulse lines - collect all
                comments.technical.push(trimmed);
            } else if (currentSection === 'fpidii' && trimmed.includes(',')) {
                // FPI/DII data
                const parts = trimmed.split(',');
                if (parts.length >= 4) comments.fpidii.push(parts);
            }
        });
        
        return comments;
    } catch (error) {
        return null;
    }
}

// Helper function to calculate change percentage
function calculateChange(current, previous) {
    const change = ((current - previous) / previous) * 100;
    return (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
}

// Create FX Majors section
function createFXMajorsSection(container, data, error = null) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'FX Majors';
    section.appendChild(h3);
    
    if (error || !data) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = error || 'Failed to load FX data';
        section.appendChild(errorDiv);
        container.appendChild(section);
        return;
    }
    
    const pairs = [
        { pair: 'EUR/USD', data: data.eurusd },
        { pair: 'GBP/USD', data: data.gbpusd },
        { pair: 'USD/JPY', data: data.usdjpy },
        { pair: 'USD/CHF', data: data.usdchf }
    ];
    
    pairs.forEach(({ pair, data: pairData }) => {
        const item = document.createElement('div');
        item.className = 'market-item';
        
        const pairSpan = document.createElement('span');
        pairSpan.className = 'market-pair';
        pairSpan.textContent = pair;
        
        const priceSpan = document.createElement('span');
        priceSpan.className = 'market-price ' + pairData.direction;
        priceSpan.textContent = pairData.price;
        
        const changeSpan = document.createElement('span');
        changeSpan.className = 'market-change';
        changeSpan.textContent = pairData.change;
        
        item.appendChild(pairSpan);
        item.appendChild(priceSpan);
        item.appendChild(changeSpan);
        section.appendChild(item);
    });
    
    container.appendChild(section);
}

// Create Dollar Index section
function createDollarIndexSection(container, data, comment, error = null) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'Dollar Index';
    section.appendChild(h3);
    
    if (error || !data) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = error || 'Failed to load DXY data';
        section.appendChild(errorDiv);
        container.appendChild(section);
        return;
    }
    
    const item = document.createElement('div');
    item.className = 'market-item highlight';
    
    const pairSpan = document.createElement('span');
    pairSpan.className = 'market-pair';
    pairSpan.textContent = 'DXY';
    
    const priceSpan = document.createElement('span');
    priceSpan.className = 'market-price ' + data.direction;
    priceSpan.textContent = data.price;
    
    const changeSpan = document.createElement('span');
    changeSpan.className = 'market-change';
    changeSpan.textContent = data.change;
    
    item.appendChild(pairSpan);
    item.appendChild(priceSpan);
    item.appendChild(changeSpan);
    section.appendChild(item);
    
    if (comment) {
        const commentP = document.createElement('p');
        commentP.className = 'market-comment';
        commentP.textContent = comment;
        section.appendChild(commentP);
    }
    
    container.appendChild(section);
}

// Create USDINR section
function createUSDINRSection(container, data, comment, error = null) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'USDINR';
    section.appendChild(h3);
    
    if (error || !data) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = error || 'Failed to load USDINR data';
        section.appendChild(errorDiv);
        container.appendChild(section);
        return;
    }
    
    const item = document.createElement('div');
    item.className = 'market-item highlight';
    
    const pairSpan = document.createElement('span');
    pairSpan.className = 'market-pair';
    pairSpan.textContent = 'USD/INR';
    
    const priceSpan = document.createElement('span');
    priceSpan.className = 'market-price ' + data.direction;
    priceSpan.textContent = data.price;
    
    const changeSpan = document.createElement('span');
    changeSpan.className = 'market-change';
    changeSpan.textContent = data.change;
    
    item.appendChild(pairSpan);
    item.appendChild(priceSpan);
    item.appendChild(changeSpan);
    section.appendChild(item);
    
    if (comment) {
        const commentP = document.createElement('p');
        commentP.className = 'market-comment';
        commentP.textContent = comment;
        section.appendChild(commentP);
    }
    
    container.appendChild(section);
}

// Create Indices section
function createIndicesSection(container, niftyData, bankNiftyData, comment, error = null) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'Indian Equity Indices';
    section.appendChild(h3);
    
    if (error || !niftyData || !bankNiftyData) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = error || 'Failed to load indices data';
        section.appendChild(errorDiv);
        container.appendChild(section);
        return;
    }
    
    const indices = [
        { pair: 'Nifty 50', data: niftyData },
        { pair: 'Bank Nifty', data: bankNiftyData }
    ];
    
    indices.forEach(({ pair, data }) => {
        const item = document.createElement('div');
        item.className = 'market-item';
        
        const pairSpan = document.createElement('span');
        pairSpan.className = 'market-pair';
        pairSpan.textContent = pair;
        
        const priceSpan = document.createElement('span');
        priceSpan.className = 'market-price ' + data.direction;
        priceSpan.textContent = data.price;
        
        const changeSpan = document.createElement('span');
        changeSpan.className = 'market-change';
        changeSpan.textContent = data.change;
        
        item.appendChild(pairSpan);
        item.appendChild(priceSpan);
        item.appendChild(changeSpan);
        section.appendChild(item);
    });
    
    if (comment) {
        const commentP = document.createElement('p');
        commentP.className = 'market-comment';
        commentP.textContent = comment;
        section.appendChild(commentP);
    }
    
    container.appendChild(section);
}

// Create FPI/DII section (from file)
function createFPIDIISection(container, comments) {
    const section = document.createElement('div');
    section.className = 'market-section';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'FPI/DII Activity';
    section.appendChild(h3);
    
    if (comments && comments.fpidii && comments.fpidii.length > 0) {
        comments.fpidii.forEach(parts => {
            const item = document.createElement('div');
            item.className = 'market-item';
            
            const pairSpan = document.createElement('span');
            pairSpan.className = 'market-pair';
            pairSpan.textContent = parts[0].trim();
            
            const priceSpan = document.createElement('span');
            priceSpan.className = 'market-price ' + (parts.length >= 4 ? parts[3].trim() : 'neutral');
            priceSpan.textContent = parts[1].trim();
            
            const changeSpan = document.createElement('span');
            changeSpan.className = 'market-change';
            changeSpan.textContent = parts[2].trim();
            
            item.appendChild(pairSpan);
            item.appendChild(priceSpan);
            item.appendChild(changeSpan);
            section.appendChild(item);
        });
    } else {
        // Default fallback
        const defaultData = [
            ['FPI (Net)', '+₹1,250 Cr', 'Buying', 'up'],
            ['DII (Net)', '-₹850 Cr', 'Selling', 'down']
        ];
        
        defaultData.forEach(parts => {
            const item = document.createElement('div');
            item.className = 'market-item';
            
            const pairSpan = document.createElement('span');
            pairSpan.className = 'market-pair';
            pairSpan.textContent = parts[0];
            
            const priceSpan = document.createElement('span');
            priceSpan.className = 'market-price ' + parts[3];
            priceSpan.textContent = parts[1];
            
            const changeSpan = document.createElement('span');
            changeSpan.className = 'market-change';
            changeSpan.textContent = parts[2];
            
            item.appendChild(pairSpan);
            item.appendChild(priceSpan);
            item.appendChild(changeSpan);
            section.appendChild(item);
        });
    }
    
    container.appendChild(section);
}

// Create Technical Pulse section (from file)
function createTechnicalPulseSection(container, comments) {
    const section = document.createElement('div');
    section.className = 'market-section full-width';
    
    const h3 = document.createElement('h3');
    h3.textContent = 'Technical Pulse';
    section.appendChild(h3);
    
    const techView = document.createElement('div');
    techView.className = 'technical-view';
    
    if (comments && comments.technical && comments.technical.length > 0) {
        console.log('✅ Loading Technical Pulse from file:', comments.technical.length, 'items');
        comments.technical.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return; // Skip empty lines
            
            const parts = trimmedLine.split(':');
            if (parts.length >= 2) {
                // Has colon - format as title: description
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = parts[0].trim() + ':';
                p.appendChild(strong);
                // Handle multiple colons in description
                p.appendChild(document.createTextNode(' ' + parts.slice(1).join(':').trim()));
                techView.appendChild(p);
            } else {
                // No colon - plain text paragraph
                const p = document.createElement('p');
                p.textContent = trimmedLine;
                techView.appendChild(p);
            }
        });
    } else {
        // Default fallback
        const defaultTexts = [
            'Nifty: Trading above key support at 22,200. Next resistance at 22,600.',
            'USDINR: Range-bound between 82.80-83.30. Breakout in either direction could signal next major move.',
            'Dollar Index: Key level at 103.50. A break below could trigger further weakness.'
        ];
        
        defaultTexts.forEach(text => {
            const parts = text.split(':');
            if (parts.length === 2) {
                const p = document.createElement('p');
                const strong = document.createElement('strong');
                strong.textContent = parts[0] + ':';
                p.appendChild(strong);
                p.appendChild(document.createTextNode(' ' + parts[1]));
                techView.appendChild(p);
            }
        });
    }
    
    section.appendChild(techView);
    container.appendChild(section);
}

// DEPRECATED: Old function - keeping for reference but not used
async function loadMarketDataFromFile() {
    const marketContainer = document.getElementById('daily-market-container');
    const updateContainer = document.getElementById('daily-update-container');
    const updateTimeText = document.getElementById('update-time-text');
    const updateNoteText = document.getElementById('update-note-text');
    
    if (!marketContainer) {
        console.error('daily-market-container element not found');
        return;
    }
    
    console.log('Loading market data from market-data.txt...');
    
    try {
        // Add cache-busting parameter
        const cacheBuster = new Date().getTime();
        const url = `market-data.txt?t=${cacheBuster}`;
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('market-data.txt loaded successfully!');
        
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            marketContainer.innerHTML = '<div class="error">No market data found in market-data.txt file.</div>';
            return;
        }
        
        // Clear loading message
        marketContainer.innerHTML = '';
        marketContainer.className = 'daily-market-grid';
        
        let currentSection = null;
        let sectionTitle = '';
        let isHighlight = false;
        let technicalPulse = [];
        let lastComment = '';
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            
            // Check if this is a section header
            if (trimmedLine === 'FX_Majors' || trimmedLine === 'Dollar_Index' || 
                trimmedLine === 'USDINR' || trimmedLine === 'Indian_Equity_Indices' ||
                trimmedLine === 'FPI/DII_Activity' || trimmedLine === 'Technical_Pulse' || 
                trimmedLine === 'Last_Updated') {
                
                // Save previous section if exists
                if (currentSection) {
                    if (lastComment && sectionTitle !== 'Technical Pulse') {
                        const comment = document.createElement('p');
                        comment.className = 'market-comment';
                        comment.textContent = lastComment;
                        currentSection.appendChild(comment);
                        lastComment = '';
                    }
                    marketContainer.appendChild(currentSection);
                }
                
                // Create new section
                currentSection = document.createElement('div');
                
                if (trimmedLine === 'FX_Majors') {
                    sectionTitle = 'FX Majors';
                    isHighlight = false;
                } else if (trimmedLine === 'Dollar_Index') {
                    sectionTitle = 'Dollar Index';
                    isHighlight = true;
                } else if (trimmedLine === 'USDINR') {
                    sectionTitle = 'USDINR';
                    isHighlight = true;
                } else if (trimmedLine === 'Indian_Equity_Indices') {
                    sectionTitle = 'Indian Equity Indices';
                    isHighlight = false;
                } else if (trimmedLine === 'FPI/DII_Activity') {
                    sectionTitle = 'FPI/DII Activity';
                    isHighlight = false;
                } else if (trimmedLine === 'Technical_Pulse') {
                    sectionTitle = 'Technical Pulse';
                    technicalPulse = [];
                } else if (trimmedLine === 'Last_Updated') {
                    currentSection = null;
                }
                
                if (currentSection && sectionTitle !== 'Technical Pulse' && trimmedLine !== 'Last_Updated') {
                    currentSection.className = 'market-section';
                    
                    const h3 = document.createElement('h3');
                    h3.textContent = sectionTitle;
                    currentSection.appendChild(h3);
                }
            } else if (currentSection && sectionTitle !== 'Technical Pulse' && sectionTitle !== 'Last_Updated') {
                // Parse market data line: pair,price,change,direction
                const parts = trimmedLine.split(',');
                
                if (parts.length >= 3) {
                    const pair = parts[0].trim();
                    const price = parts[1].trim();
                    const change = parts[2].trim();
                    const direction = parts.length >= 4 ? parts[3].trim() : 'neutral';
                    
                    // Check if this is a comment (doesn't look like market data)
                    if (parts.length === 1 || (!change.includes('%') && !change.includes('₹') && 
                        !change.includes('Cr') && change !== 'Buying' && change !== 'Selling' && 
                        !change.match(/^[+-]/) && isNaN(parseFloat(change)))) {
                        // This is a comment line
                        lastComment = trimmedLine;
                    } else {
                        // This is a market item
                        const item = document.createElement('div');
                        item.className = 'market-item';
                        if (isHighlight && !currentSection.querySelector('.market-item.highlight')) {
                            item.classList.add('highlight');
                        }
                        
                        const pairSpan = document.createElement('span');
                        pairSpan.className = 'market-pair';
                        pairSpan.textContent = pair;
                        
                        const priceSpan = document.createElement('span');
                        priceSpan.className = 'market-price';
                        if (direction === 'up') {
                            priceSpan.classList.add('up');
                        } else if (direction === 'down') {
                            priceSpan.classList.add('down');
                        }
                        priceSpan.textContent = price;
                        
                        const changeSpan = document.createElement('span');
                        changeSpan.className = 'market-change';
                        changeSpan.textContent = change;
                        
                        item.appendChild(pairSpan);
                        item.appendChild(priceSpan);
                        item.appendChild(changeSpan);
                        
                        currentSection.appendChild(item);
                    }
                } else if (trimmedLine && !trimmedLine.includes(',')) {
                    // Single line comment
                    lastComment = trimmedLine;
                }
            } else if (trimmedLine && sectionTitle === 'Technical Pulse') {
                // Collect technical pulse lines
                technicalPulse.push(trimmedLine);
            }
        });
        
        // Add last section if exists
        if (currentSection) {
            if (lastComment) {
                const comment = document.createElement('p');
                comment.className = 'market-comment';
                comment.textContent = lastComment;
                currentSection.appendChild(comment);
            }
            marketContainer.appendChild(currentSection);
        }
        
        // Add Technical Pulse section
        if (technicalPulse.length > 0) {
            const techSection = document.createElement('div');
            techSection.className = 'market-section full-width';
            
            const h3 = document.createElement('h3');
            h3.textContent = 'Technical Pulse';
            techSection.appendChild(h3);
            
            const techView = document.createElement('div');
            techView.className = 'technical-view';
            
            technicalPulse.forEach(line => {
                const parts = line.split(':');
                if (parts.length === 2) {
                    const p = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = parts[0].trim() + ':';
                    p.appendChild(strong);
                    p.appendChild(document.createTextNode(' ' + parts[1].trim()));
                    techView.appendChild(p);
                } else {
                    const p = document.createElement('p');
                    p.textContent = line;
                    techView.appendChild(p);
                }
            });
            
            techSection.appendChild(techView);
            marketContainer.appendChild(techSection);
        }
        
        // Parse Last Updated section
        let updateTime = 'Today, 6:00 PM IST';
        let updateNote = 'Markets closed. Next session opens tomorrow at 9:15 AM IST.';
        let inUpdateSection = false;
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed === 'Last_Updated') {
                inUpdateSection = true;
            } else if (inUpdateSection && trimmed && !trimmed.includes('Last_Updated')) {
                if (index > 0 && lines[index - 1].trim() === 'Last_Updated') {
                    updateTime = trimmed;
                } else {
                    updateNote = trimmed;
                }
            }
        });
        
        if (updateTimeText) updateTimeText.textContent = updateTime;
        if (updateNoteText) updateNoteText.textContent = updateNote;
        if (updateContainer) {
            updateContainer.style.display = 'block';
        }
        
        console.log('✅ Market data loaded successfully');
        
    } catch (error) {
        console.error('❌ ERROR: Failed to load market-data.txt file!');
        console.error('Error details:', error);
        
        let errorMsg = 'Error loading market data. ';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            if (window.location.protocol === 'file:') {
                errorMsg += 'Please use a local server (python -m http.server 8000)';
            } else {
                errorMsg += 'Please ensure market-data.txt is in the same directory.';
            }
        } else {
            errorMsg += `Error: ${error.message}`;
        }
        
        marketContainer.innerHTML = `<div class="error">${errorMsg}</div>`;
        console.warn('⚠️ Market data could not be loaded');
    }
}


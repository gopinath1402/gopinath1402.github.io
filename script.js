// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }


    // Update active navigation state based on current page
    function updateActiveNav() {
        const navLinks = document.querySelectorAll('.nav-menu a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            
            // Check if it's the current page
            if (linkHref.includes('index.html') && currentPath.includes('index.html')) {
                link.classList.add('active');
            } else if (linkHref.includes('contact.html') && currentPath.includes('contact.html')) {
                link.classList.add('active');
            } else if (linkHref.includes('content.html') && currentPath.includes('content.html')) {
                link.classList.add('active');
            } else if (linkHref.includes('macroeconomics.html') && currentPath.includes('macroeconomics.html')) {
                link.classList.add('active');
            }
        });
    }

    // Update on page load
    updateActiveNav();

    // Update on hash change
    window.addEventListener('hashchange', function() {
        updateActiveNav();
    });

    // Load content based on current page
    if (window.location.pathname.includes('content.html') || window.location.href.includes('content.html')) {
        // Load Daily Updates and Market data (for Current Market Update page)
        setTimeout(() => {
            if (typeof loadDailyUpdates === 'function') {
                loadDailyUpdates().catch(err => {
                    console.error('Error in loadDailyUpdates:', err);
                });
            }
            if (typeof loadLiveMarketData === 'function') {
                loadLiveMarketData();
            }
        }, 100);
    } else if (window.location.pathname.includes('macroeconomics.html') || window.location.href.includes('macroeconomics.html')) {
        // Load videos automatically on macroeconomics page
        loadVideosFromFile();
    }

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

            // Create video item with title from videos.txt file
            console.log('Creating video:', { videoId, title: displayTitle });
            const videoItem = createVideoItem(videoId, validVideoCount, displayTitle);
            
            videosContainer.appendChild(videoItem);
            
            // Debug: Verify title is in DOM after append
            setTimeout(() => {
                console.log('🔍 Checking DOM for video:', videoId);
                console.log('Video item HTML:', videoItem.outerHTML.substring(0, 500));
                
                const titleEl = videoItem.querySelector('.video-title-display');
                const containerEl = videoItem.querySelector('.video-title-container');
                
                console.log('Container found:', !!containerEl);
                console.log('Title found:', !!titleEl);
                
                if (containerEl) {
                    console.log('Container HTML:', containerEl.outerHTML);
                } else {
                    console.error('❌ Container element NOT found!');
                }
                
                if (titleEl) {
                    console.log('✅ Title element found:', {
                        textContent: titleEl.textContent,
                        innerHTML: titleEl.innerHTML,
                        computedStyle: {
                            display: window.getComputedStyle(titleEl).display,
                            visibility: window.getComputedStyle(titleEl).visibility,
                            opacity: window.getComputedStyle(titleEl).opacity,
                            color: window.getComputedStyle(titleEl).color,
                            height: window.getComputedStyle(titleEl).height,
                            width: window.getComputedStyle(titleEl).width
                        }
                    });
                } else {
                    console.error('❌ Title element NOT found in DOM for video:', videoId);
                    console.error('Full video item:', videoItem);
                    console.error('Available elements:', Array.from(videoItem.querySelectorAll('*')).map(el => el.className || el.tagName));
                }
            }, 300);
            
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
                ></iframe>
            </div>
        </div>
        <div class="video-title-container" style="padding: 1.5rem !important; background: #ffffff !important; border-top: 1px solid #e5e7eb !important; width: 100% !important; box-sizing: border-box !important; display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 100 !important; min-height: 80px !important;">
            <h3 class="video-title-display" style="margin: 0 0 1rem 0 !important; padding: 0.5rem 0 !important; color: #1e293b !important; font-weight: 600 !important; font-size: 1.2rem !important; line-height: 1.6 !important; display: block !important; visibility: visible !important; opacity: 1 !important; background: #ffffff !important; word-wrap: break-word; overflow-wrap: break-word; max-width: 100% !important; width: 100% !important; box-sizing: border-box !important;">${title || 'Video Title'}</h3>
        </div>
    `;

    // Debug: Verify innerHTML was set correctly
    console.log('📝 Created video item for:', videoId, 'with title:', title);
    
    // Check if title container exists, if not, create it manually
    let titleContainer = item.querySelector('.video-title-container');
    
    if (!titleContainer) {
        console.warn('⚠️ Title container not found in innerHTML, creating manually...');
        // Create title container manually
        titleContainer = document.createElement('div');
        titleContainer.className = 'video-title-container';
        titleContainer.style.cssText = 'padding: 1.5rem !important; background: #ffffff !important; border-top: 1px solid #e5e7eb !important; width: 100% !important; box-sizing: border-box !important; display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 100 !important; min-height: 80px !important;';
        
        // Create title element
        const titleEl = document.createElement('h3');
        titleEl.className = 'video-title-display';
        titleEl.textContent = title || 'Video Title';
        titleEl.style.cssText = 'margin: 0 0 1rem 0 !important; padding: 0.5rem 0 !important; color: #1e293b !important; font-weight: 600 !important; font-size: 1.2rem !important; line-height: 1.6 !important; display: block !important; visibility: visible !important; opacity: 1 !important; background: #ffffff !important; word-wrap: break-word; overflow-wrap: break-word; max-width: 100% !important; width: 100% !important; box-sizing: border-box !important;';
        
        // Append to container
        titleContainer.appendChild(titleEl);
        // Note: YouTube link removed as requested
        
        // Append container to item
        item.appendChild(titleContainer);
        console.log('✅ Title container created and appended manually');
    } else {
        console.log('✅ Title container found in innerHTML');
    }

    // Set initial cursor style (click events will be attached after DOM insertion)
    // Note: Click events are attached in loadVideosFromFile() after item is appended to DOM

    return item;
}

// Function to create an article item (kept for potential future use)
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

// Load Daily Updates from daily-updates.txt
async function loadDailyUpdates() {
    const updatesContainer = document.getElementById('daily-updates-container');
    if (!updatesContainer) {
        console.error('Daily updates container not found');
        return;
    }

    try {
        // Check if we're using file:// protocol (local file access)
        const isLocal = window.location.protocol === 'file:';
        
        if (isLocal) {
            updatesContainer.innerHTML = `
                <div class="error-message" style="background: #fff3cd; padding: 1rem; border-radius: 8px; border: 2px solid #ffc107;">
                    <p style="color: #856404; font-weight: bold;">⚠️ Local File Access Detected</p>
                    <p style="color: #856404; margin-top: 0.5rem;">Please use an HTTP server to load daily-updates.txt</p>
                    <p style="color: #856404; font-size: 0.9rem; margin-top: 0.5rem;">Run: <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                    <p style="color: #856404; font-size: 0.9rem; margin-top: 0.5rem;">Then access: <code style="background: #fff; padding: 0.2rem 0.5rem; border-radius: 4px;">http://localhost:8000/content.html</code></p>
                </div>
            `;
            return;
        }
        
        const timestamp = new Date().getTime();
        const fileUrl = `daily-updates.txt?t=${timestamp}`;
        
        const response = await fetch(fileUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const text = await response.text();

        // Parse the file - format: Multiple entries separated by "---"
        // Each entry: Date on first line, then content until next "---" or end
        const entries = [];
        // Split by "---" on its own line (with optional whitespace)
        const sections = text.trim().split(/\n\s*---\s*\n/);
        
        if (sections.length === 0) {
            throw new Error('File is empty');
        }

        // Parse each section
        sections.forEach((section) => {
            const trimmedSection = section.trim();
            if (!trimmedSection) return;
            
            const lines = trimmedSection.split('\n');
            if (lines.length === 0) return;
            
            const date = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            // Check if date is in YYYY-MM-DD format
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (datePattern.test(date) && content) {
                entries.push({ date, content });
            }
        });

        if (entries.length === 0) {
            throw new Error('No valid entries found in file');
        }

        // Sort entries by date (newest first)
        entries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Descending order (newest first)
        });

        // Process and create HTML for all entries
        const updatesHTML = entries.map((entry, index) => {
            // Format the date
            let formattedDate = entry.date;
            try {
                const updateDate = new Date(entry.date);
                if (!isNaN(updateDate.getTime())) {
                    formattedDate = updateDate.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } catch (e) {
                console.warn('Date parsing failed, using original date:', e);
            }

            // Process content lines
            const processedContent = entry.content.split('\n').map(line => {
                const trimmedLine = line.trim();
                
                if (trimmedLine === '') {
                    return '<br>';
                } else if (trimmedLine.startsWith('- ')) {
                    return `<p class="update-bullet">${trimmedLine.substring(2)}</p>`;
                } else if (trimmedLine.startsWith('• ')) {
                    return `<p class="update-bullet">${trimmedLine.substring(2)}</p>`;
                } else if (trimmedLine.startsWith('-')) {
                    return `<p class="update-bullet">${trimmedLine.substring(1).trim()}</p>`;
                } else if (trimmedLine.startsWith('•')) {
                    return `<p class="update-bullet">${trimmedLine.substring(1).trim()}</p>`;
                } else if (trimmedLine.toLowerCase().includes('highlights') || trimmedLine.toLowerCase().includes('key')) {
                    return `<h4 class="update-subheading">${trimmedLine}</h4>`;
                } else {
                    return `<p>${trimmedLine}</p>`;
                }
            }).join('');

            // Determine title based on date
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            
            let title = "Market Update";
            if (entryDate.getTime() === today.getTime()) {
                title = "Today's Market Update";
            } else if (entryDate.getTime() === today.getTime() - 86400000) {
                title = "Yesterday's Market Update";
            } else {
                title = "Market Update";
            }

            return `
                <div class="daily-update-card">
                    <div class="update-header">
                        <h3>${title}</h3>
                        <span class="update-date">${formattedDate}</span>
                    </div>
                    <div class="update-content">
                        ${processedContent}
                    </div>
                </div>
            `;
        }).join('');

        // Create HTML for all daily updates
        updatesContainer.innerHTML = updatesHTML;

        console.log('Daily updates displayed successfully');
        console.log('Final HTML:', updatesContainer.innerHTML.substring(0, 200));

    } catch (error) {
        console.error('Error loading daily updates:', error);
        console.error('Error stack:', error.stack);
        updatesContainer.innerHTML = `
            <div class="error-message" style="background: #fee; padding: 1rem; border-radius: 8px; border: 2px solid #f00;">
                <p style="color: #c00; font-weight: bold;">Unable to load daily updates. Please check if daily-updates.txt file exists.</p>
                <p class="error-detail" style="color: #900; margin-top: 0.5rem;">Error: ${error.message}</p>
                <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">Make sure daily-updates.txt is in the same directory as content.html</p>
            </div>
        `;
    }
}

async function loadLiveMarketData() {
    const marketContainer = document.getElementById('daily-market-container');
    const updateContainer = document.getElementById('daily-update-container');
    const updateTimeText = document.getElementById('update-time-text');
    const updateNoteText = document.getElementById('update-note-text');

    if (!marketContainer) {
        console.error('daily-market-container element not found');
        return;
    }

    console.log('Loading Technical Pulse data...');

    // Show loading state
    marketContainer.className = 'daily-market-grid';

    try {
        // Load Technical Pulse (from file - commentary)
        let technicalData = null;
        try {
            const fallbackComments = await fetchMarketComments();
            if (fallbackComments && fallbackComments.technical && fallbackComments.technical.length > 0) {
                technicalData = fallbackComments;
            }
        } catch (error) {
            console.warn('Failed to load technical pulse from file:', error);
        }

        createTechnicalPulseSection(marketContainer, technicalData);

        // Update timestamp
        const now = new Date();
        const timeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        if (updateTimeText) updateTimeText.textContent = timeStr + ' IST';
        if (updateNoteText) updateNoteText.textContent = 'Technical Pulse updated';
        if (updateContainer) updateContainer.style.display = 'block';

        console.log('✅ Technical Pulse loaded successfully');

    } catch (error) {
        console.error('❌ ERROR loading Technical Pulse:', error);
        marketContainer.innerHTML = `<div class="error">Error loading Technical Pulse. ${error.message}</div>`;
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



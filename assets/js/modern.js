// Modern JavaScript for enhanced user experience
document.addEventListener('DOMContentLoaded', function() {
    
    // Scroll indicator
    function updateScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) {
            // Create scroll indicator if it doesn't exist
            const indicator = document.createElement('div');
            indicator.className = 'scroll-indicator';
            document.body.appendChild(indicator);
        }
        
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.querySelector('.scroll-indicator').style.transform = `scaleX(${scrolled / 100})`;
    }
    
    window.addEventListener('scroll', updateScrollIndicator);
    
    // Smooth reveal animations for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards for animation
    document.querySelectorAll('.card, .profile-container').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
    
    // Enhanced form handling
    const newsletterForm = document.getElementById('newsletter-form');
    const contactForm = document.getElementById('contact-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = this.querySelector('.btn-subscribe');
            const originalText = button.textContent;
            
            button.classList.add('loading');
            button.textContent = 'Subscribing...';
            
            // Simulate API call
            setTimeout(() => {
                button.classList.remove('loading');
                button.textContent = 'Subscribed!';
                button.style.background = 'var(--secondary-color)';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = this.querySelector('.btn-send');
            const originalText = button.textContent;
            
            button.classList.add('loading');
            button.textContent = 'Sending...';
            
            // Simulate API call
            setTimeout(() => {
                button.classList.remove('loading');
                button.textContent = 'Message Sent!';
                button.style.background = 'var(--secondary-color)';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add background blur when scrolled
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(26, 31, 46, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(26, 31, 46, 0.8)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add hover effects to tags
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Performance optimization: Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    // Add ripple effect to buttons
    document.querySelectorAll('.cta-button, .btn-subscribe, .btn-send, .badge').forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// Add CSS for ripple effect
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 600ms linear;
    background-color: rgba(255, 255, 255, 0.6);
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.keyboard-navigation *:focus {
    outline: 2px solid var(--primary-color) !important;
    outline-offset: 2px !important;
}
`;

// Inject ripple CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

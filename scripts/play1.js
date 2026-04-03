const track = document.getElementById('track');
    let cards = Array.from(track.children);
    const gap = 20;
    
    // 1. CLONING LOGIC (For Infinite Loop)
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, cards[0]);

    // Re-select all cards including clones
    cards = Array.from(track.children);
    let currentIndex = 1; // Start at the first original card
    let isTransitioning = false;

    function updateCarousel(animate = true) {
        const containerWidth = window.innerWidth;
        const cardWidth = cards[0].offsetWidth;
        const centerOffset = (containerWidth / 2) - (cardWidth / 2);
        
        track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.2, 1, 0.3, 1)' : 'none';
        
        const moveAmount = -currentIndex * (cardWidth + gap) + centerOffset;
        track.style.transform = `translateX(${moveAmount}px)`;

        // Highlight active card
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === currentIndex);
        });
    }

    // 2. INFINITE JUMP LOGIC
    track.addEventListener('transitionend', () => {
        isTransitioning = false;
        if (currentIndex === cards.length - 1) {
            currentIndex = 1;
            updateCarousel(false);
        }
        if (currentIndex === 0) {
            currentIndex = cards.length - 2;
            updateCarousel(false);
        }
    });

    function moveNext() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateCarousel(true);
    }

    function movePrev() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateCarousel(true);
    }

    // 3. SWIPE & DRAG LOGIC
    let startX = 0;
    let isDragging = false;

    const startAction = (e) => {
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        isDragging = true;
        stopAutoSwipe();
    };

    const endAction = (e) => {
        if (!isDragging) return;
        const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) moveNext();
            else movePrev();
        }
        isDragging = false;
        startAutoSwipe();
    };

    track.addEventListener('touchstart', startAction);
    track.addEventListener('touchend', endAction);
    track.addEventListener('mousedown', startAction);
    track.addEventListener('mouseup', endAction);

    // 4. AUTO SWIPE
    let autoTimer;
    function startAutoSwipe() {
        autoTimer = setInterval(moveNext, 4000);
    }
    function stopAutoSwipe() {
        clearInterval(autoTimer);
    }

    // Initialize
    window.addEventListener('resize', () => updateCarousel(false));
    updateCarousel(false);
    startAutoSwipe();

//function handleItemClick(element) {
//  const itemId = element.getAttribute('data-id');
//  console.log("Clicked ID:", itemId);
//}
// Select all elements with the class "item"
// Select all elements with the class "item"
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', function() {
        const rawId = this.getAttribute('data-id');
        
            const itemId = btoa(rawId);
            window.location.href = './content.html?id=' + itemId;
        
    });
});

// FIXED: Selection for carousel cards
// We use the 'cards' variable you already defined at the top of your script
cards.forEach(card => {
    card.addEventListener('click', function() {
        const rawId = this.getAttribute('data-id');
        if (rawId) {
            const itemId = btoa(rawId);
            window.location.href = './content.html?id=' + itemId;
        }
    });
});

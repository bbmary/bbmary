(function() {
	'use strict';

	let currentIndex = 2; // Start at index 2 (first real slide after clones)
	const totalSlides = 12;
	let isAnimating = false;
	let sliderTrack;
	let allSlides;
	let autoplayInterval;

	function updateSlider(instant = false) {
		if (!sliderTrack || !allSlides.length) return;
		if (isAnimating && !instant) return;

		isAnimating = true;

		const progressFill = document.querySelector('.progress-fill');

		// Remove active class from all items
		allSlides.forEach(item => {
			item.classList.remove('active');
		});

		// Add active class to current item
		allSlides[currentIndex].classList.add('active');

		// Calculate real slide number (0-5)
		const realSlide = (currentIndex - 2 + totalSlides) % totalSlides;

		// Update progress bar
		const progressPercentage = ((realSlide + 1) / totalSlides) * 100;
		if (progressFill) {
			progressFill.style.width = progressPercentage + '%';
		}

		// Center the active slide precisely
		const wrapper = document.querySelector('.slider-wrapper');
		const wrapperCenter = wrapper.offsetWidth / 2;

		// Get actual gap from computed styles
		const computedStyle = window.getComputedStyle(sliderTrack);
		const gap = parseFloat(computedStyle.gap) || 48; // 3em ≈ 48px

		// Calculate offset to center active slide
		let offset = 0;
		for (let i = 0; i < currentIndex; i++) {
			offset += allSlides[i].offsetWidth;
			if (i < currentIndex) {
				offset += gap;
			}
		}
		offset += allSlides[currentIndex].offsetWidth / 2;

		const centerPosition = offset - wrapperCenter;

		if (instant) {
			sliderTrack.style.transition = 'none';
			// Force reflow
			sliderTrack.offsetHeight;
		} else {
			sliderTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
		}

		sliderTrack.style.transform = `translateX(-${centerPosition}px)`;

		setTimeout(() => {
			isAnimating = false;
		}, instant ? 0 : 500);
	}

	function nextSlide() {
		if (isAnimating) return;

		currentIndex++;

		// If we reach last clone, show it then instantly jump to real first
		if (currentIndex === allSlides.length - 2) {
			updateSlider(false);
			setTimeout(() => {
				currentIndex = 2;
				updateSlider(true);
			}, 550);
		} else {
			updateSlider(false);
		}
	}

	function prevSlide() {
		if (isAnimating) return;

		currentIndex--;

		// If we reach first clone, show it then instantly jump to real last
		if (currentIndex === 1) {
			updateSlider(false);
			setTimeout(() => {
				currentIndex = allSlides.length - 3;
				updateSlider(true);
			}, 550);
		} else {
			updateSlider(false);
		}
	}

	function goToSlide(index) {
		if (isAnimating) return;
		currentIndex = index;
		updateSlider();
	}

	function resetAutoplay() {
		if (autoplayInterval) {
			clearInterval(autoplayInterval);
		}
		autoplayInterval = setInterval(nextSlide, 3000);
	}

	// Initialize slider on DOM ready
	function initSlider() {
		sliderTrack = document.querySelector('.slider-track');
		allSlides = document.querySelectorAll('.slider-item');

		// Click event for each slider item
		allSlides.forEach((item, index) => {
			item.addEventListener('click', () => {
				goToSlide(index);
				resetAutoplay();
			});
		});

		// Keyboard navigation
		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				prevSlide();
				resetAutoplay();
			} else if (e.key === 'ArrowRight') {
				nextSlide();
				resetAutoplay();
			}
		});

		// Touch events for mobile
		let touchStartX = 0;
		let touchEndX = 0;
		const sliderContainer = document.querySelector('.slider-container');

		sliderContainer.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].screenX;
		}, { passive: true });

		sliderContainer.addEventListener('touchend', (e) => {
			touchEndX = e.changedTouches[0].screenX;
			handleSwipe();
		}, { passive: true });

		function handleSwipe() {
			const swipeThreshold = 50;
			if (touchStartX - touchEndX > swipeThreshold) {
				nextSlide();
				resetAutoplay();
			} else if (touchEndX - touchStartX > swipeThreshold) {
				prevSlide();
				resetAutoplay();
			}
		}

		// Initial setup - start centered on first real slide
		updateSlider(true);

		// Auto-play (infinite loop)
		resetAutoplay();
	}

	// Wait for DOM to be ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSlider);
	} else {
		initSlider();
	}

})();

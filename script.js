document.addEventListener("DOMContentLoaded", function() {
    
    
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            /* Toggle between adding and removing the "active" class */
            this.classList.toggle("active");

            /* Toggle between hiding and showing the active panel */
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
});


function moveSlide(galleryId, step) {
    const gallery = document.getElementById(galleryId);
    const slides = gallery.querySelectorAll('.gallery-img');
    const totalSlides = slides.length;
    const galleryImages = gallery.querySelector('.gallery-images');
    
    let currentIndex = parseInt(galleryImages.getAttribute('data-current-index') || '0');
    currentIndex = (currentIndex + step + totalSlides) % totalSlides;
    galleryImages.setAttribute('data-current-index', currentIndex);
    
    const offset = -currentIndex * 100;
    galleryImages.style.transform = `translateX(${offset}%)`;
}
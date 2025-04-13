let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.header .navbar');

menu.onclick = () =>{
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

var swiper = new Swiper(".home-slider", {
    loop: true, 
    navigation: {
        nextEl: ".swiper-button-next", 
        prevEl: ".swiper-button-prev", 
    },
});

var swiper = new Swiper(".reviews-slider", {
    loop: true,
    spaceBetween: 20,
    autoHeight:true,
    grabCursor:true, 
    breakpoints: {
        640: {
            slidesPerView: 1,
            
        }, 
        768: {
            slidesPerView: 2,
            
        },
        1024: {
            slidesPerView: 3,
        }, 
    },
});

document.addEventListener('DOMContentLoaded', () => {
    let boxes = [...document.querySelectorAll('.packages .box-container .box')];
    for (let i = 9; i < boxes.length; i++) {
        boxes[i].style.display = 'none';
    }

    let loadMoreBtn = document.querySelector('.packages .load-more .btn');
    let currentItem = 9; 

    loadMoreBtn.onclick = () => {
        for (let i = currentItem; i < Math.min(currentItem + 9, boxes.length); i++) {
            boxes[i].style.display = 'inline-block';
        }
        currentItem += 9; // Increment by 9
        if (currentItem >= boxes.length) {
            loadMoreBtn.style.display = 'none';
        }
    }

    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn === 'true') {
                window.location.href = 'book.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
});
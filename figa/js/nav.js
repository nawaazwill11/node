window.addEventListener('load', function() {
    var site_name = document.getElementById('site-name');
    site_name.addEventListener('click', function() {
        window.location.href = "./index.html";
    });

    nav_list = document.getElementById('nav-menu-list');
    ham = document.getElementById('ham');
    ham.addEventListener('click', function() {
        slideNavList();
    });
    var container = document.getElementsByClassName('container')[0];
    container.addEventListener('click', function() {
        if (nav_list.classList.contains('open')) {
            nav_list.classList.remove('open');
            nav_list.classList.add('close');
            toggleHam();
        }
    });
     
});
function slideNavList() {
    toggleHam();
    if (nav_list.classList.contains('close') || nav_list.classList.length == 0) {
        nav_list.classList.remove('close');
        nav_list.classList.add('open');
    } else {
        nav_list.classList.remove('open');
        nav_list.classList.add('close');
    }
}
function toggleHam() {
    let img = ham.children[0];
    if (img.getAttribute('src') == './img/ham-white.svg') {
        ham.children[0].setAttribute('src', './img/cross-white.svg');
    } else {
        ham.children[0].setAttribute('src', './img/ham-white.svg');
    }
}
function buttonEffects(nav, param) {
    if (nav.classList.contains(param[0])) {
        nav.classList.remove(param[0]);
        nav.classList.add(param[1]);
    } else {
        nav.classList.remove(param[1]);
        nav.classList.add(param[0]);
    }
}
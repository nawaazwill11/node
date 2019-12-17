var ham, nav_list;
window.addEventListener('load', function() {
    var site_name = document.getElementsByClassName('site');
    site_name.addEventListener('click', function() {
        window.location.href = "./index.html";
    });
    var navigate = document.getElementsByClassName('navigate');
    for (let i = 0; i < navigate.length; i++) {
        let nav = navigate[i];
        let param = ['yin', 'yang'];
        nav.addEventListener('mouseover', function() {
            buttonEffects(nav, param);
        });
        nav.addEventListener('mouseleave', function() {
            buttonEffects(nav, param);
        });
        nav.addEventListener('touchend', function() {
            buttonEffects(nav, param);
        });
        addScrollEvent(nav, click, 'data-scroll');
    }
    nav_list = document.getElementById('nav-control-list');
    var nav_children = nav_list.children;
    for (let i = 0; i < nav_children.length; i++) {
        let child = nav_children[i];
        addScrollEvent(child, 'click', 'data-scroll', true);
    }
    ham = document.getElementsByClassName('ham')[0];
    ham.addEventListener('click', function() {
        slideNavList();
    });
    var root = document.getElementsByClassName('root')[0];
    root.addEventListener('click', function() {
        if (nav_list.classList.contains('open')) {
            nav_list.classList.remove('open');
            nav_list.classList.add('close');
            toggleHam();
        }
    });
    var uptop = document.getElementById('top');
    uptop.addEventListener('click', function() {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    });
    var contact = document.getElementById('to-contact');
    addScrollEvent(contact, 'click', 'data-scroll');
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
function addScrollEvent(element, event, tag_name, slide=false) {
    element.addEventListener(event, function() {
        var tag = element.getAttribute(tag_name);
        scrollToElement(tag);
        if (slide) {
            slideNavList();
        }
        if (tag == 'contact') {
            let handle_container = document.getElementsByClassName('handle-container')[0];
            setTimeout(function() {
                handle_container.classList.remove('shadow');
            }, 800);
            handle_container.classList.add('shadow');
        }
    });
}
function scrollToElement(tag) {
    var positionX = 0
      , positionY = 0;
    if (tag != 'logo') {
        positionY -= 80;
    }
    let pageElement = document.getElementById(tag);
    while (pageElement != null) {
        positionX += pageElement.offsetLeft;
        positionY += pageElement.offsetTop;
        pageElement = pageElement.offsetParent;
    }
    window.scroll({
        top: positionY,
        left: positionX,
        behavior: 'smooth'
    });
}
function scrollToView(tag) {
    let scrollTo = document.getElementById(tag);
    scrollTo.scrollIntoView({
        behavior: "smooth"
    });
}

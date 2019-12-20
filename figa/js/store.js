const box_options = document.querySelectorAll('.box-menu');
box_options.forEach(option => {
    option.addEventListener('click', function (e) {
        closeBoxOverlays();
        this.parentNode.parentNode.children[1].style.display = 'block';
    });
});

const box_back = document.querySelectorAll('.box-back');
box_back.forEach(back => {
    back.addEventListener('click', function () {
        this.parentNode.parentNode.style.display = 'none';
    });
});

const box_next = document.querySelectorAll('.box-next');
box_next.forEach(next => {
    next.addEventListener('click', function () {
        this.parentNode.parentNode.parentNode.parentNode.children[2].style.display = 'block';
    });
});

const file_adder = document.getElementById('file-adder');
file_adder.addEventListener('click', function () {
    setTimeout(() => {
        this.style.backgroundColor = 'aliceblue';    
    }, 100);
    this.style.backgroundColor = '#dce4ea';
});

const view = document.getElementById('view-dropdown');
view.addEventListener('change', function () {
    function removeClass(element, class_name) {
        for (let i = 0; i < element.length; i++) {
            element[i].classList.remove(class_name);
        }
    }
    function addClass(element, class_name) {
        for (let i = 0; i < element.length; i++) {
            element[i].classList.add(class_name);
        }
    }
    const row = document.getElementsByClassName('row');
    const row_box = document.getElementsByClassName('row-box');
    const box_main = document.getElementsByClassName('box-main');
    const box_menu = document.getElementsByClassName('box-menu');
    if (this.value == 'Grid') {
        removeClass(row, 'row-list');
        removeClass(row_box, 'row-box-list');
        removeClass(box_main, 'box-main-list');
        removeClass(box_menu, 'box-menu-list');
    }
    else {
        addClass(row, 'row-list');
        addClass(row_box, 'row-box-list');
        addClass(box_main, 'box-main-list');
        addClass(box_menu, 'box-menu-list');
    }
});

// hide box-menu-list on elsewhere click
const box_overlay = document.querySelectorAll('.box-overlay');
box_overlay.forEach(bo => {
    bo.addEventListener('focus', function (e) {
        // this.style.display = 'none';
        console.log('fout');
    })
})
document.addEventListener('click', function (e) {
    const target = e.target;
    if (!(target.closest('.box-overlay') || target.closest('.box-menu') || target.closest('.box-menu-img'))) {
       closeBoxOverlays();
    }
});
function closeBoxOverlays() {
    box_overlay.forEach(bo => {
        bo.style.display = 'none';
    });
}
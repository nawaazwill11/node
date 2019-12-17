const box_options = Array.from(document.getElementsByClassName('box-menu'));
box_options.forEach(option => {
    option.addEventListener('click', function () {
        this.parentNode.parentNode.children[1].style.display = 'block';
    });
});

const box_back = Array.from(document.getElementsByClassName('box-back'));
box_back.forEach(back => {
    back.addEventListener('click', function () {
        this.parentNode.parentNode.style.display = 'none';
    });
});

const box_next = Array.from(document.getElementsByClassName('box-next'));
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
    let row_box = document.getElementsByClassName('row-box')[0];
    let box_main = document.getElementsByClassName('box-main')[0];
    let box_menu = document.getElementsByClassName('box-menu')[0];
    if (this.value == 'Grid') {
        row_box.classList.remove('row-box-list');
        box_main.classList.remove('box-main-list');
        box_menu.classList.remove('box-menu-list');
    }
    else {
        row_box.classList.add('row-box-list');
        box_main.classList.add('box-main-list');
        box_menu.classList.add('box-menu-list');
    }
})
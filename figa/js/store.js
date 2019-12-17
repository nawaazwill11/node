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
        console.log(this.parentNode.parentNode.parentNode.parentNode.children[2]);
    });
});

function addListenerRowBox() {
    // shows box overlay l1
    const box_options = document.querySelectorAll('.box-menu');
    box_options.forEach(option => {
        option.addEventListener('click', function (e) {
            closeBoxOverlays();
            this.parentNode.parentNode.children[1].style.display = 'block';
        });
    });

    // hides box overlay l2 
    const box_back = document.querySelectorAll('.box-back');
    box_back.forEach(back => {
        back.addEventListener('click', function () {
            this.parentNode.parentNode.style.display = 'none';
        });
    });

    // shows box overlay l2
    const box_next = document.querySelectorAll('.box-next');
    box_next.forEach(next => {
        next.addEventListener('click', function () {
            this.parentNode.parentNode.parentNode.parentNode.children[2].style.display = 'block';
        });
    });

    // file adder click effect
    const file_adder = document.getElementById('file-adder');
    file_adder.addEventListener('click', function () {
        setTimeout(() => {
            this.style.backgroundColor = 'aliceblue';    
        }, 100);
        this.style.backgroundColor = '#dce4ea';
    });

    // Toggles view between list and grid views
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
    // Action on click event outside box-overlay aka box menu
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (!(target.closest('.box-overlay') || target.closest('.box-menu') || target.closest('.box-menu-img'))) {
        closeBoxOverlays();
        }
    });

    // closes the option menu on elsewhere click
    function closeBoxOverlays() {
        box_overlay.forEach(bo => {
            bo.style.display = 'none';
        });
    }
}

// generates row boxes 
// generateRowBox(count, contents)
// @param count: Specifies number of boxes
// @param contents: A list of objects containing various information about the box

function generateRowBox(count, contents) {
    const row = document.getElementsByClassName('row')[0];
    for (let i = 0; i < count; i ++) {
        // row_box
        content = contents[0];
        const row_box = document.createElement('div');
        row_box.classList.add('row-box', 'bdark');
        row.appendChild(row_box);

        // box_main
        const box_main = document.createElement('div');
        box_main.className = 'box-main';
        row_box.appendChild(box_main);

        // box_content_name
        const box_content_name = document.createElement('div');
        box_content_name.className = 'box-content-name';
        box_content_name.innerText = '#' + content.name;
        box_main.append(box_content_name);

        // box_content_small
        const box_content_small = document.createElement('div');
        box_content_small.className = 'box-content-small';
        box_content_small.innerText = 'Total file: ' + content.size;
        box_main.appendChild(box_content_small);

        // box_menu
        const box_menu = document.createElement('div');
        box_menu.className = 'box-menu';
        box_main.appendChild(box_menu);
        // box_menu_img
        const box_menu_img = document.createElement('img');
        box_menu_img.src = 'img/more.svg';
        box_menu_img.alt = 'menu';
        box_menu_img.classList.add('box-menu-img', 'img20');
        box_menu.appendChild(box_menu_img);

        // box_overlay l1
        const box_overlay = document.createElement('div');
        box_overlay.classList.add('box-overlay', 'l1');
        row_box.appendChild(box_overlay);

        // l1 box_option
        const box_options = document.createElement('div');
        box_options.className = 'box-options';
        box_overlay.appendChild(box_options);
        // l1 box_menu_list
        const box_menu_list = document.createElement('ul');
        box_menu_list.classList.add('box-menu-list', 'styleless', 'padb5');
        box_options.appendChild(box_menu_list);
        // l1 box_menu_list item
        const box_menu_item = ['Favorite', 'Download', 'Delete', 'Details'];
        box_menu_item.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            box_menu_list.append(li);
            if (item === 'Details') {
                li.classList.add('li-linked', 'box-next');
                li.innerText = '';
                const span = document.createElement('span');
                span.innerText = item;
                li.appendChild(span);
            }
        });

        // box_overlay l2
        const box_overlay_2 = document.createElement('div');
        box_overlay_2.classList.add('box-overlay', 'l2');
        row_box.appendChild(box_overlay_2);
        
        // l2 box_overlay_title
        const box_overlay_title = document.createElement('div');
        box_overlay_title.className = 'box-overlay-title';
        box_overlay_2.appendChild(box_overlay_title);
        
        // l2 box_back
        const box_back = document.createElement('img');
        box_back.src = 'img/back.svg';
        box_back.alt = 'back';
        box_back.classList.add('box-back', 'img20');
        box_overlay_title.appendChild(box_back);
        
        // l2 box_option
        const box_options_2 = document.createElement('div');
        box_options_2.className = 'box-options';
        box_overlay_2.appendChild(box_options_2);
        
        // l2 box_menu_list
        const box_menu_list_2 = document.createElement('ul');
        box_menu_list_2.classList.add('box-menu-list', 'styleless', 'padb5');
        box_options_2.appendChild(box_menu_list_2);
        const box_menu_item_2 = ['No. of files', 'Date created', 'Total access', 'Last access'];
        box_menu_item_2.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item + ': ';
            box_menu_list_2.append(li);
            const span = document.createElement('span');
            span.innerText = content[item];
            li.appendChild(span);
        });
    }
    addListenerRowBox();
}

// Sample
generateRowBox(1, [{
    name: 'MeriYaarKiShaadi',
    size: '50',
    'No. of files': '50',
    'Date created': '22/11/19',
    'Total access': '12',
    'Last access': '01/12/19'
}]);
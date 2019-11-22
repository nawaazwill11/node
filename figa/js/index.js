$('#select-multiple').change(function () {
    if (this.checked) {
        selectModeOn(); // enters select mode
    }
    else {
        selectModeOff(); // exists select mode
    }
});
// show an overlay on imagebox with options
$('#file-container').on('mouseover', '.image-box', function () {
     imageboxOMOV.bind(this)();
});
// hide the overlay on imagebox with options
$('#file-container').on('mouseout', '.image-box', function () {
    imageboxOMOU.bind(this)();
});
// show a preview window on eye click
$('#file-container').on('click', '.eye', function () {
    if ($('body').find('div#preview-window')) {
        removePreview();
    }
    let preview = makePreviewWindow.bind($(this));
    preview();
});
// remove preview-window with escape keypress
$(document).keyup(function (e) {
    if (e.keyCode == 27) {
        removePreview();
    }
});
// remove preview-window by clicking x
$('body').on('click', '#close-preview', function () {
    removePreview();
});
// download images
$('#download').click(function () {
    let imagebox_list = []
    let imagebox = document.getElementsByClassName('image-box');
    for (let i = 0; i < imagebox.length; i++) {
        let classList = imagebox[i].classList;
        if (classList[classList.length - 1] == 'selected') {
            imagebox_list.push(imagebox[i]);
        }
    }
    downloadImages(imagebox_list);
});
// disables enter key's default behavior.
$('body').on('keydown keyup keypress', '#search-tag-form', function (e) {   
    if (e.keyCode === 13) {
        e.preventDefault();
        return false;
    }
});
// create autocomplete dropdown for search tags
$('#search_tags').keyup(function () {
    let formData = new FormData(document.forms[0]);
    $.ajax({
        async: true,
        method: 'post',
        url: '/tags',
        processData: false,
        contentType: false,
        data: formData,
        success: function(data) {
            dropDownOptions(data);
        },
        error: function(data) {
            console.error(data);
        }
    });
});
$('#search_tags').focus(function () {
    matchContainerToggle();
});
$('#search_tags').focusout(function () {
    $('#match-container').css('display', 'none');
});
// creates th preview-window
function makePreviewWindow() {
    let preview = document.createElement('div');
    preview.id = 'preview-window';
    let img = document.createElement('img');
    preview.appendChild(img);
    img.src = $(this).parent().parent().children()[0].src;
    let former = document.createElement('span');
    let latter = document.createElement('span');
    img = document.createElement('img');
    img.src = './img/former.svg';
    former.id = 'former';
    former.className = 'navigate';
    former.appendChild(img);
    img = document.createElement('img');
    img.src = './img/latter.svg';
    latter.id = 'latter';
    latter.className = 'navigate';
    latter.appendChild(img);
    preview.appendChild(former);
    preview.appendChild(latter);
    let close = document.createElement('span');
    close.id = 'close-preview';
    close.textContent = 'x';
    preview.appendChild(close);
    $('body').append(preview);
}
// removes the preview window
function removePreview() {
    $('body').find('div#preview-window').remove();
}
// image-box mouse over effect 
function imageboxOMOV() {
    let child = $(this).children()[1];
    child.style.opacity = 0.98;
}
// image-box mouse out effect 
function imageboxOMOU() {
    let child = $(this).children()[1];
    child.style.opacity = 0;
}
// binds mouse over effect on imagebox
function bindHOver () {
    $('#file-container').on('mouseover', '.image-box', imageboxOMOV);
}
// unbinds mouse over effect on imagebox
function unbindHOver() {
    $('#file-container').off('mouseover', '.image-box');
}
// select mode on features
function selectModeOn() {
    $('.image-box').css('border', '1px solid'); // adds border to image boxes
    unbindHOver(); // unbinds hover effect
    // adds select effect
    $('#file-container').on('click', '.image-box', function () {
        let classList = $(this).attr('class').split(/\s/);
        if (classList[classList.length - 1] == 'selected') {
            $(this).removeClass('selected');
        }
        else {
            $(this).addClass('selected');            
        }
        toggleOptions();
    });   
}
// remove select mode features
function selectModeOff() {
    $('.image-box').css('border', 'none'); // removes border
    bindHOver(); // bind the hover effect back
    $('#file-container').off('click', '.image-box'); // unbind the click event
    // removes selected classes from all image boxes
    let imagebox = document.getElementsByClassName('image-box');
    for (let i = 0; i < imagebox.length; i++) {
        imagebox[i].classList = imagebox[i].classList[0];
    }
    toggleOptions();
}
// shows and hides option
function toggleOptions() {
    let imagebox = document.getElementsByClassName('image-box');
    let count = 0;
    for (let i = 0; i < imagebox.length; i++) {
        let classList = imagebox[i].classList;
        if (classList[classList.length - 1] == 'selected') {
            count ++;
            break;
        }
    }
    if (count > 0) {
        $('#options').removeClass('option-hide');
    }
    else {
        $('#options').addClass('option-hide');
    }
}

// download images 
function downloadImages(elements) {
    if (elements.length == 0) {
        alert('Please select image(s) to download.');
    }
    for (let i = 0; i < elements.length; i++) {
        let fake_link = document.createElement('a');
        let src = elements[i].children[0].src;
        let filename = src.slice(src.lastIndexOf('/') + 1, );
        fake_link.href = src;
        fake_link.setAttribute('hidden', '');
        fake_link.setAttribute('download', filename);
        elements[i].appendChild(fake_link);
        fake_link.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        fake_link.click();
        fake_link.remove();
    }
}
// generates dropdown UI elements
function dropDownOptions(data) {
    let match_container = document.getElementById('match-container');
    match_container.innerHTML = '';
    if (data.length > 0) {
        data = data.split(',');
        let list = document.createElement('ul');
        list.id = 'search-option-list';
        data.forEach(item => {
            let option = document.createElement('li');
            option.textContent = item;
            option.className = 'search-option';
            option.addEventListener('mousedown', function () {
                $('#search_tags').val(this.innerText);
                match_container.style.display = 'none';
            });
            option.addEventListener('keydown', function (e) {
                if (e.keyCode === 13) {
                    $('#search_tags').val(this.innerText);
                }
            });
            list.appendChild(option);
        });
        match_container.appendChild(list);
    }
    matchContainerToggle();
}
// shows and hides autocomplete list items.
function matchContainerToggle() {
    if ($('#match-container').children().length > 0) {
        $('#match-container').css('display', 'block');
    }
    else {
        $('#match-container').css('display', 'none');
    }
}

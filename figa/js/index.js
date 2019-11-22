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
// creates th preview-window
function makePreviewWindow() {
    let preview = document.createElement('div');
    preview.id = 'preview-window';
    let img = document.createElement('img');
    preview.appendChild(img);
    img.src = $(this).parent().parent().children()[0].src;
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
        showOptions();
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
}
function showOptions() {
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

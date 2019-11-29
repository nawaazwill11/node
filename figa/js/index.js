let tags_list;
window.onload = fetchSuggestions;

// multiple input based actions
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
// shows suggestions if the search input is in focus
$('#search_tags').focus(function () {
    matchContainerToggle();
});
// hides suggestions if the search input is out of focus
$('#search_tags').focusout(function () {
    $('#match-container').css('display', 'none');
});
// button press effect
$('#search_control').mousedown(function () {
    $(this).css({'border-style': 'inset', 'width': '25px'});
});
// ""
$('#search_control').mouseup(function () {
    $(this).css({'border-style': 'none', 'width': '31px'});
});
// previous image
$('body').on('click', '#former', function () {
    navigateImage.bind($(this))(0);
    
});
$('body').on('click', '#latter', function () {
    navigateImage.bind($(this))(1);
});
// create autocomplete dropdown for search tags
$('#search_tags').keyup(function (e) {
    if (e.keyCode === 38 || e.keyCode === 40) { // navigates up and down through the suggested tag options
        console.log('here');
        listOptionSelect(e.keyCode);
    }
    else if (e.keyCode === 13) { // appends selected / focused suggested item to search input
        selectActiveOption();
    }
    else {
        dropDownOptions(reduceOptions(getMatchingTags()));
    }
    
});
$('#search_control').click(function () {
    let error = searchHasError(1);
    if (!error) {
        let formData = new FormData(document.forms[0]);
        $.ajax({
            async: true,
            url: '/search',
            method: 'post',
            contentType: false,
            processData: false,
            data: formData,
            success: function (data) {
                populateFileContainer(data);
            },
            error: function (error) {
                console.log(error)
            }
        });
    }
});
function fetchSuggestions() {
    console.log('fired');
    $.ajax({
        async: true,
        url: '/suggestion',
        method: 'post',
        contentType: false,
        processData: false,
        data: JSON.stringify({}),
        success: function (data) {
            makeTagsList(data);
        },
        error: function(error) {
            console.error();
        }
    });
}
// makes a list of all available tags 
function makeTagsList (data) {
    tags_list = data.split(',');
    console.log('tags_list: ', tags_list);
}
// checks search input for errors
function searchHasError(show) {
    let search_tags = $('#search_tags');
    let tags_val = search_tags.val();
    let error;
    if (tags_val.length === 0) {
        error = 'Error: Please add one or more tags.';
    } 
    else {
        let split_tags = tags_val.split(',');
        for (let i = 0; i < split_tags.length; i++) {
            tag = split_tags[i].trim();
            if (!/^\w/.test(tag)) {
                error = 'Error: Tags should begin or end only with alphabets, numbers or an underscore.' 
                break;
            }
            else if (tag.length < 2) {
                error = 'Error: Each tag should have at least 2 characters.'
                break;
            }
            else if (/\s/.test(tag)) {
                error = 'Error: Tags cannot contain spaces.';
            }
        }
    }
    if (error) {
        search_tags.css('border-color', 'red');
        search_tags.focus();
        if (show) {
            $('#error').text(error);
        }
    }
    else {
        search_tags.css('border-color', 'unset');
        $('#error').text('');
    }
    return error;

}
// creates the preview-window
function makePreviewWindow() {
    let preview = document.createElement('div');
    preview.id = 'preview-window';
    let img = document.createElement('img');
    img.setAttribute('data-id', $(this).parent().parent()[0].id);
    img.src = $(this).parent().parent().children()[0].src;
    preview.appendChild(img);
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
            option.addEventListener('mousedown', function (e) {
                $('#search_tags').val(autoFill() + this.innerText);
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
// append selected tag from suggestions to the search input
function autoFill() {
    let match_container = $('#match-container');
    let current_val = getCurrentOptions(); // gets current tags in the input
    let comma = current_val.length > 1 ? ', ' : ''; // adds coma
    return current_val.slice(0, current_val.length - 1).join(', ') + comma; // inserts values to search tags input
}
// grabs the current tags in the search input, trims them and returns as a list
function getCurrentOptions() {
    let current_val = $('#search_tags').val().split(',');
    return Array.from(current_val.map(function (item) {
        return item.trim();
    }));
}
// adds active class to the currently navigates or selected option from suggestion
function listOptionSelect(key) {
    let search_list = $('#search-option-list')
    let child = search_list.find('li.active');
    if (child.length > 0) {
        child = $(child[0]);
        if (key === 40) {
            child.next().addClass('active');
        }
        else {
            child.prev().addClass('active');
        }
        child.removeClass('active');
    }
    else {
        if (key === 38) {
            $($('.search-option')[$('.search-option').length - 1]).addClass('active');
        }
        else {
            $($('.search-option')[0]).addClass('active');
        }
    }
}
// appends currently selected or focus suggested list item to search input
function selectActiveOption() {
    let child = $('#search-option-list').find('li.active')[0];
    $('#search_tags').val(autoFill() + child.innerText + ', ');
    dropDownOptions(reduceOptions(getMatchingTags()));
}
// remove repetitive options from search suggestion
function reduceOptions(data) {
    let filtered_list = [];
    let flag = false;
    let current_options = getCurrentOptions();
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < current_options.length; j++) {
            if (current_options[j] === data[i]) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            filtered_list.push(data[i]);
        }
        flag = false;
    }
    return filtered_list.join(',');
}
// navigates preview images
function navigateImage(ind) {
    let img = $(this).parent().children()[0];
    let id = img.getAttribute('data-id');
    let ele;
    try {
        if (ind) {
            ele = $(`#${id}`).next()[0].children[0];
        }
        else {
            ele = $(`#${id}`).prev()[0].children[0];
        }
        img.src = ele.src;
        img.setAttribute('data-id', ele.parentElement.id);
        
    }
    catch (e) {}
}

function getMatchingTags() {
    let matched_list = [];
    let current_tags = $('#search_tags').val();
    let temp = current_tags.split(',');
    tag = temp[temp.length - 1].trim();
    if (tag.length > 0) {
        for (let i = 0; i < tags_list.length; i++) {
            if (tags_list[i].search(new RegExp(tag)) >= 0) {
                matched_list.push(tags_list[i]);
            }
        }
    }
    return matched_list;
}
function populateFileContainer(data) {
    let file_container = document.getElementById('file-container');
    file_container.innerHTML = '';
    let files = data.split(',');
    let id = 0
    files.forEach(file => {
        let img_box = document.createElement('div');
        img_box.id = ++id;
        img_box.className = 'image-box';
        let img = document.createElement('img');
        img.src = `./img/${file}`;
        img_box.appendChild(img);
        img_box.insertAdjacentHTML('beforeend', "<div class='over'><div class='eye'><img class='over-img' src='./img/eye.svg' alt=' title='View'></div><div class='star'><img class='over-img' src='./img/star.svg' alt=' title='Favorite'></div><div class='trash'><img class='over-img' src='./img/trash.svg' alt=' title='Delete'></div></div>");
        file_container.appendChild(img_box);
    });
}
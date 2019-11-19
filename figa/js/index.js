let add_image = document.getElementById('add-image');
let upload_inp = document.getElementById('upload-inp');
let uploaded_files;
let description = document.getElementById('total_upload');
let file_types = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/gif'
];
add_image.addEventListener('click', e => {
    upload_inp.click();
});

upload_inp.addEventListener('change', e => {
    uploaded_files = upload_inp.files;
    let stage = document.getElementById('upload-stage');
    if (uploaded_files.length === 0) {
        description.textContent = 'No files selected.';
    }
    else{
        new Promise((resolve, reject) => {
            for (let i = 0; i < uploaded_files.length; i++){
                if (validFileType(uploaded_files[i])) {
                    let image_box = document.createElement('div');
                    image_box.id = uploaded_files[i].name;
                    image_box.className = 'image-box';
                    let img = document.createElement('img');
                    img.src = window.URL.createObjectURL(uploaded_files[i]);
                    image_box.appendChild(img);
                    stage.appendChild(image_box);
                    let del = document.createElement('span');
                    del.className = 'delete';
                    del.addEventListener('click', function () {
                        let remove = dropImage.bind(this);
                        remove();
                    });
                    let del_img = document.createElement('img');
                    del_img.src = '/img/delete.svg';
                    del.appendChild(del_img);
                    image_box.appendChild(del);
                    resolve()
                }
                else {
                    description.textContent = `Cannot upload ${uploaded_files[i].name}, not a valid image.`
                    reject()
                }
            }
        })
        .then(() => {
            descImageCount();
        })
        .catch(error => {
            console.error(error);
        });
    }

});

function descImageCount() {
    let stage = document.getElementById('upload-stage');
    let description = document.getElementById('total_upload');
    description.innerHTML = `<b>Total files:</b> ${stage.childElementCount - 1}`;
}

function dropImage(that) {
    if (!that) {
        that = this;
    }
    that.parentNode.remove(that.parentNode);
    // this.parentNode.remove(this.parentNode);
    descImageCount();
}

function validFileType(file) {
    for (let i = 0; i < file_types.length; i++) {
        if (file_types[i] === file.type) {
            return true;
        }
    }
    return false;
}

$('#uploadForm').on('click', '#upload-do', function (e) {
    event.stopPropagation();
    let formData = new FormData(document.forms.uploadForm);
    let tags = $('#tags');
    let tags_val = tags.val();
    let error = null;
    if (tags_val.length === 0) {
        error = 'Error: Please add one or more tags.';
    }
    else {
        let split_tags = tags_val.split(',');
        for (let i = 0; i < split_tags.length; i++) {
            tag = split_tags[i].trim();
            if (tag.length < 2) {
                error = 'Error: Each tag should have at least 2 characters.'
                break;
            }
            else if (!/^\w|\w$/.test(tag)) {
                error = 'Error: Tags should begin or end only with alphabets, numbers or an underscore.' 
                break;
            }
            else if (/\s/.test(tag)) {
                error = 'Error: Tags cannot contain spaces.';
            }
        }
    }
    if (uploaded_files === undefined || $('#upload-stage').children().length === 1) {
        alert('Error: No files selected to upload.');
    }
    else if (error) {
        tags.css('border-color', 'red');
        alert(error);
        tags.focus();
    }

    else {
        let butter_paper = document.getElementById('butter-paper');
        butter_paper.classList.add('show');
        $.ajax({
            async: false,
            url: '/upload',
            method: 'post',
            processData: false,
            contentType: false,
            data: formData,
            success: function(data) {
                postUpload(data);
                butter_paper.classList.remove('show');
            },
            error: function(data) {
                butter_paper.classList.remove('show');                
                alert(data.responseText);
                console.error(data);
            }
        });
    }
});

function postUpload(data) {
    if (data !== 'Uploaded.') {
        let response = JSON.parse(data);
        showOnlyDuplicates(response['duplicates']);
        console.log('response: ', response);
        if (response['duplicates'].length > 0) {
            let message = response['duplicates'].join(', ');
            let reupload = confirm(`Duplicates found.\nCannot upload: ${message}\nRetry with different files or file names.`);
            if (reupload) {

            }
        }
    }
    else {
        alert('Upload successfully.')
        console.log('Uploaded successfully.')
    }
}

function showOnlyDuplicates(dup_list) {
    let unmatch_list = [];
    let flag = false;
    // deletes images that were uploaded and keep the ones that weren't.
    for (let file = 0; file < uploaded_files.length; file ++) {
        for (let dup = 0; dup < dup_list.length; dup++) {
            if (dup_list[dup] === uploaded_files[file].name) {
                flag = true;    
                break;
            }
        }
        if (!flag) {
            unmatch_list.push(uploaded_files[file].name);
            delete uploaded_files[file]; // [important]removes from uploaded files variable.
        }
        flag = false;
    }

    console.log('unmatched list: ', unmatch_list);
    for (file in unmatch_list) {
        let el = document.getElementById(unmatch_list[file]);
        if (el) {
            el.remove(el);
        }
    }
}
let add_image = document.getElementById('add-image');
let upload_inp = document.getElementById('upload-inp');
let stage = document.getElementById('upload-stage');
let uploaded_files = [];
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
    let raw_files = upload_inp.files;
    if (raw_files.length > 0) {
        Array.from(raw_files).forEach(file => {
            if (validFileType(file) && notDuplicate(file.name)) {
                uploaded_files = [...uploaded_files, ...[file]];
                let image_box = document.createElement('div');
                image_box.id = file.name;
                image_box.className = 'image-box';
                let img = document.createElement('img');
                img.src = window.URL.createObjectURL(file);
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
            }
            else {
                description.textContent = `Cannot upload ${file.name}, not a valid image.`
            }
        });
        descImageCount();
    }

});

function notDuplicate(filename) {
    for (index in uploaded_files) {
        if (uploaded_files[index].name === filename) {
            return false;
        }
    }
    return true;
}

function descImageCount() {
    let description = document.getElementById('total_upload');
    description.innerHTML = `<b>Total files:</b> ${stage.childElementCount - 1}`;
}

function removeFileFromUploadedFiles(filename) {
    let i = 0;
    for (; i < uploaded_files.length; i++) {
        if (filename == uploaded_files[i].name) {
            break;
        }
    }
    uploaded_files.splice(i, 1);
    upload_inp.value = null;
}

function dropImage(that) {
    if (!that) {
        that = this;
    }
    that.parentNode.remove(that.parentNode);
    // this.parentNode.remove(this.parentNode);
    removeFileFromUploadedFiles(that.parentNode.id);
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
        let formData = new FormData();
        formData.append('tags', tags_val);
        
        let files = uploaded_files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
            console.log(files[i]);
        }

        let butter_paper = document.getElementById('butter-paper');
        butter_paper.classList.add('show');
        $.ajax({
            async: true,
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
        if (response['duplicates'].length > 0) {
            let message = response['duplicates'].join(', ');
            let reupload = confirm(`Duplicates found.\nCannot upload: ${message}\nRetry with different files or file names.`);
            // if (reupload) {

            // }
            showOnlyDuplicates(response['duplicates']);
        }
    }
    else {
        alert('Upload successfully.')
        let remove_ele = Array.from(stage.children).slice(1, );
        remove_ele.forEach(ele => {
            ele.remove();
        });
        document.getElementById('upload-inp').value = null;
        descImageCount();
        $('#tags').val('');
        console.log('Uploaded successfully.')
    }
    uploaded_files = [];
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
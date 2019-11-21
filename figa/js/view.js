window.onload = function () {
    $.ajax({
        async: true,
        url: '/view',
        method: 'post',
        processData: false,
        contentType: false,
        success: function(data) {
            renderImages(data);
        },
        error: function(error) {
            console.log(error)
        }
    });
}

function renderImages(data) {
    let photo_container = document.getElementById('photo-container');
    let files_list = data.split(',');
    for (let i = 0; i < files_list.length; i++) {
        let file = files_list[i];
        let photo = document.createElement('div');
        photo.id = file;
        photo.className = 'photo';
        let img = document.createElement('img');
        img.src = `/data/${file}`;
        photo.appendChild(img);
        photo_container.appendChild(photo);
    }
}

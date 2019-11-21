$('#file-container').on('mouseover', '.image-box', function () {
    let child = $(this).children()[1];
    child.style.display = 'block'; //('display', 'block');
});
$('#file-container').on('mouseout', '.image-box', function () {
    let child = $(this).children()[1];
    child.style.display = 'none';
});

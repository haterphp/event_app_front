
let openMenu = (modal, animation_element, display = 'block') => {
    $(modal).modal('show');
    let start_pos = $(animation_element).width();
    $(animation_element).css({
        display: display,
        left: -start_pos + 'px'
    });
    $(animation_element).animate({
        left: 0
    }, 200);
};

let closeMenu = (modal, animation_element) => {
    let start_pos = $(animation_element).width();
    $(animation_element).animate({
        left: -start_pos + 'px'
    }, 200);
    setTimeout(() => {
        $(animation_element).css({
            display: 'none'
        });
        $(modal).modal('hide')
    }, 210);
};

let formAuthOpen = () =>{
    let form = $('#forms_auth');
    let start_pos = form.width();
    form.css({
        left: start_pos + 'px'
    })
    form.animate({
        left: 0
    }, 200);
}

let formAuthClose = () => {
    let form = $('#forms_auth');
    let start_pos = form.width();
    form.css({
        left: 0
    })
    form.animate({
        left: start_pos + 'px'
    }, 200);
}

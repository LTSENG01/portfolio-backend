const typedOptions = {
    stringsElement: '#typed-strings',
    typeSpeed: 70,
    backSpeed: 60,
    backDelay: 1000,
    smartBackspace: true,
    loop: true
};

let typed = new Typed('#typed', typedOptions);
typed.stop();

$(document).ready(() => {

    // Start typing library, hide rocket
    setTimeout(() => typed.start(), 500);
    $("#main-rocket").hide();

    // Click handler for the down arrow
    $("#main-chevron").click((e) => {
        let rocketSelector = $("#main-rocket");
        let chevronSelector = $(".fa-chevron-down");
        rocketSelector.addClass("animate__animated animate__fadeIn");
        rocketSelector.show();
        chevronSelector.hide();

        setTimeout(() => {
            rocketSelector.hide();
            chevronSelector.show();
        }, 1500);
    });

    // Reset card tilt (for mobile)
    const linkCard = $('.link-card');
    const tilt = linkCard.tilt();
    $('.link-no-decor').on('mouseup touchend', () => {
        tilt.tilt.reset.call(tilt);
    });

    // Email click handler to display email in case of broken mailto links
    $("#email").click(e => {
        let emailText = $("#email-text");
        emailText.text("larry.tseng.1@gmail.com");
        emailText.css("font-size", "0.75rem");

        setTimeout(() => {
            emailText.text("Email");
            emailText.css("font-size", "1.6rem");
        }, 10000);
    });
});

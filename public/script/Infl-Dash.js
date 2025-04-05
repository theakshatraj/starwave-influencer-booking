$(document).ready(function() {
    $("#updatePwd").click(function() {
        let obj = {
            type: "GET",
            url: "/updatePwd",
            data: {
                txtEmail: $("#txtEmail").val(),
                oldPwd: $("#oldPwd").val(),
                newPwd: $('#newPwd').val(),
                conPwd: $('#conPwd').val()
            }
        };
        $.ajax(obj).done(function(resp) {
            alert(resp);
        }).fail(function(err) {
            alert(err.statusText);
        });
    });
});


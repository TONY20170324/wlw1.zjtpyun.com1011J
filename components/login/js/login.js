/**
 * 摘    要：登录
 */

$(function () {

    var e = $("#home");
    // slider
    !function () {
        var i, t, r, a, s, n = e.find(".slider"),
            o = n.find(".slider-list"),
            l = n.find(".dot-list"),
            c = o.find("a"),
            d = 0,
            u = !0,
            g = null,
            h = 3,
            f = o.children("div").length;
        for (c.bind("click",
            function () {
                var e = $(this).closest("div").index() + 1;
                tlog = window.tlog || [],
                    tlog.push("c:w_index_adframe_" + e)
            }),

                 o.find("div:first").show().siblings().hide(), i = function (e, i) {
            u && (u = !1, l.find("a").eq(e).addClass("active").siblings().removeClass("active"), o.find("div").eq(e).siblings().hide().end().show(), u = !0,
            i && i.call(this))
        },
                 t = function () {
                     u && (d++, d >= f && (d = 0), i(d), clearTimeout(g), g = setTimeout(t, 1e3 * h))
                 },
                 r = function () {
                     g = setTimeout(t, 1e3 * h)
                 },
                 a = "", s = 0; f > s; s++) a += '<a href="javascript:;"',
        0 == s && (a += ' class="active"'),
            a += "></a>";
        l.html(a).find("a").click(function () {
            var e = $(this).index();
            d = e,
                clearTimeout(g),
                i(e,
                    function () {
                        r()
                    })
        }),
            r()
    }();

});


$(function () {

    if ($.browser.msie) {
        $('.user-pw').html('<input type="text" name="username" value="" id="username" class="text input-user" placeholder="用户名"> <input type="password" name="password" value="" id="password" autocomplete="off" class="text input-password" placeholder="密码">');
    } else {
        $('.user-pw').html('<input type="text" name="username" value="" id="username" class="text input-user" placeholder="用户名"> <input type="text" name="password" value="" id="password"  onfocus=\'this.type="password"\'  autocomplete="off" class="text input-password" placeholder="密码">');
    }

    //获取cookie,赋值
    $('input[name="username"]').val(getCookie("user_login"));//用户名

    //登录时的错误信息
    var $loginError = getCookie("login_error");
    if ($loginError) {
        if ($loginError == "uername_or_pwd_error") {
            $('#login_error').html("<font color='red'>用户名或密码错误</font>");
        } else if ($loginError == "username_not_exists") {
            $('#login_error').html("<font color='red'>用户名不存在</font>");
        } else if ($loginError == "entry_rand") {
            $('#login_error').html("<font color='red'>请输入验证码</font>");
        } else if ($loginError == "rand_error") {
            $('#login_error').html("<font color='red'>验证码错误</font>");
        } else if ($loginError == "sys_error") {
            $('#login_error').html("<font color='red'>系统繁忙,请稍后再试!</font>");
        }
        delCookie("login_error");
    }

    //验证码
    $('.validcode,.changecode').bind('click', function () {
        $('.validcode').prop("src", "/validate?" + Math.random());
    });
    $('.validcode').click();

    /**
     * 平台登录及表单验证
     */
    $('#loginBtn').bind("click", function () {
        var $username = $('input[name="username"]').val();
        var $password = $('#password').val();
        if (!$username) {
            $('#login_error').html("<font color='red'>请输入用户名和密码</font>");
            return;
        } else if ($username.length > 16 || $username.length < 2) {
            $('#login_error').html("<font color='red'>用户名错误</font>");
            return;
        } else {
            //删除cookie
            delCookie("user_login");
            //设置cookie
            addCookie("user_login", $username, 24 * 7);
        }

        if (!$password) {
            $('#login_error').html("<font color='red'>请输入用户名和密码</font>");
            return;
        } else if ($password.length > 16 || $password.length < 3) {
            $('#login_error').html("<font color='red'>密码错误</font>");
            return;
        }

        if ($('#rand').length) {
            var $rand = $('#rand').val();
            if (!$rand) {
                $('#login_error').html("<font color='red'>请输入验证码</font>");
                return;
            }
        }
        $("#loginForm").submit();
    });

    //按回车键,提交表单
    $(document).keyup(function (event) {
        if (event.keyCode == 13) {
            var $username = $('input[name="username"]').val();
            var $password = $('#password').val();
            if ($username && $password) {
                if ($('#rand').length) {
                    var $rand = $('#rand').val();
                    if ($rand) {
                        if ($rand.length == 4) {
                            $("#loginBtn").trigger("click");
                        } else if ($rand.length > 4) {
                            $('#login_error').html("<font color='red'>验证码错误</font>");
                        }
                    }
                } else {
                    $("#loginBtn").trigger("click");
                }
            }
        }
    });
});


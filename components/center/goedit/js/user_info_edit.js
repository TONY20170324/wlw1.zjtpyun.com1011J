/**
 * Copyright © 2015 浙江托普仪器有限公司 - All Rights Reserved.
 * 摘    要：
 * 作    者：zhangyc
 * 日    期：2015-04-20 上午11:33
 */
$(function () {
    if ($.browser.msie) {
        $('#myOldPwd').html('<input type="password" id="oldPwd" autocomplete="off" class="inputBox"/><span id="oldPwd_error"></span>');
        $('#myNewPwd').html('<input type="password" id="newPwd" autocomplete="off" class="inputBox"/><span id="newPwd_error"></span>');
        $('#myConfirmPwd').html('<input type="password" id="confirmPwd" class="inputBox"/><span id="confirmPwd_error"></span>');
    } else {
        $('#myOldPwd').html('<input onfocus=\'this.type="password"\' type="text" id="oldPwd" autocomplete="off" class="inputBox"/><span id="oldPwd_error"></span>');
        $('#myNewPwd').html('<input onfocus=\'this.type="password"\' type="text" id="newPwd" autocomplete="off" class="inputBox"/><span id="newPwd_error"></span>');
        $('#myConfirmPwd').html('<input onfocus=\'this.type="password"\' type="text" id="confirmPwd" class="inputBox"/><span id="confirmPwd_error"></span>');
    }

    $('#mSave').unbind('click');
    $('#mSave').bind('click', function () {

        var $userId = $('#userId').val();
        var $oldPwd = $('#oldPwd').val();
        var $newPwd = $('#newPwd').val();
        var $confirmPwd = $('#confirmPwd').val();
        var $truename = $('#truename').val();
        var $sex = $('input[name="sex"]:checked').val();
        var $mobile = $('#mobile').val();
        var $email = $('#email').val();

        if (checkOldPwd($oldPwd) &&
            checkNewPwd($newPwd, $confirmPwd) &&
            checkConfirmPwd($confirmPwd, $newPwd) &&
            checkTruename($truename) &&
            checkEmail($email) &&
            checkMobile($mobile)) {
            $.ajax({
                type: "POST",
                url: '/user/center/edit/save',
                data: {
                    'userId': $userId,
                    'oldPwd': $oldPwd,
                    'newPwd': $newPwd,
                    'confirmPwd': $confirmPwd,
                    'truename': $truename,
                    'sex': $sex,
                    'mobile': $mobile,
                    'email': $email
                },
                dataType: "json",
                cache: false,
                success: function (data) {
                    if (data) {
                        var code = data.code;
                        var msg = data.msg;
                        var result = data.result;
                        if (code == 200) {
                            $.fn.tDefArtDialog("保存成功", function () {
                                closeFancy(top.reSetInfo(result.sex, result.truename, result.mobile));
                            });
                        } else {
                            $('#' + code + "_error").html("<font color='red'>" + msg + "</font>");
                        }
                    } else {
                        $('#addForm-item-error').html("<div style='color:red;'>修改信息失败</div>");
                    }
                },
                error: function () {

                }
            });
        }
    });

    $('#oldPwd').bind('blur', function () {
        checkOldPwd($(this).val());
    });

    $('#newPwd').bind('blur', function () {
        checkNewPwd($(this).val(), $('#confirmPwd').val(), $('#oldPwd').val());
    });

    $('#confirmPwd').bind('blur', function () {
        checkConfirmPwd($(this).val(), $('#newPwd').val());
    });

    $('#truename').bind('blur', function () {
        checkTruename($(this).val());
    });

    $('#mobile').bind('blur', function () {
        checkMobile($(this).val());
    });
    $('#email').bind('blur', function () {
        checkEmail($(this).val());
    });

    $('#mReset,.close').bind('click', function () {
        closeFancy();
    });

});


// 关闭fancyBox窗口  支持回调函数
var closeFancy = function (callback, config) {
    var a = parent.$.fancybox || $.fancybox;
    if (a != undefined) {
        a.close();
        if (typeof callback == 'function') {
            callback(config);
        }
    }

    return false;
};

function checkOldPwd($thisVal) {
    if (!$thisVal) {
        $.fn.tTipArtDialog("<font color='red'>请输入密码</font>", $('#oldPwd'));
        //$('#oldPwd_error').html('<font color="red"> 请输入密码</font>');
        return false;
    } else if ($thisVal.length < 3 || $thisVal.length > 16) {
        $('#oldPwd_error').html('<font color="red"> 密码长度必须在3至16位之间</font>');
        return false;
    } else {
        $('#newPwd,#confirmPwd').prop("");
        $('#oldPwd_error').html('');
    }
    return true;
}

function checkNewPwd($thisVal, $confimVal) {

    if ($thisVal) {
        if (($thisVal.length < 3 || $thisVal.length > 16)) {
            $('#newPwd_error').html('<font color="red"> 密码长度必须在3至16位之间</font>');
            return false;
        }

        if ($thisVal == $confimVal) {
            $('#confirmPwd_error').html('');
        } else {
            if ($confimVal) {
                $('#confirmPwd_error').html('<font color="red"> 两次密码输入不一致</font>');
            }
            $('#confirmPwd').focus();
        }
    } else {
        if (!$confimVal) {
            $('#confirmPwd_error').html('');
        } else {
            $('#newPwd_error').html('<font color="red"> 请输入新密码</font>');
            return false;
        }
    }

    $('#newPwd_error').html('');
    return true;
}

function checkConfirmPwd($thisVal, $newVal) {

    if (!$thisVal && !$newVal) {
        $('#confirmPwd_error,#newPwd_error').html('');
        return true;
    }
    if (!$thisVal && $newVal) {
        $('#confirmPwd_error').html('<font color="red"> 请输入确认密码</font>');
        return false;
    } else if ($thisVal && $thisVal.length < 3 || $thisVal.length > 16) {
        $('#confirmPwd_error').html('<font color="red"> 密码长度必须在3至16位之间</font>');
        return false;
    } else if ($thisVal && !$newVal) {
        //$('#newPwd_error').html('<font color="red"> 请输入新密码</font>');
        $('#newPwd').focus();
        return false;
    } else if ($thisVal != $newVal && $newVal) {
        $('#confirmPwd_error').html('<font color="red"> 两次密码输入不一致</font>');
        return false;
    }

    $('#confirmPwd_error').html('');
    return true;
}


function checkTruename($thisVal) {
    var flag = false;
    if (!$thisVal) {
        $('#truename_error').html("<span style='color:red;'> 联系人不能为空</span>");
    } else if ($thisVal.length > 16) {
        $('#truename_error').html('<font color="red"> 联系人长度必须在1至16之间</font>');
    } else {
        $('#truename_error').html('');
        flag = true;
    }
    return flag;
}


function checkMobile($thisVal) {
    var flag = true;
    if ($thisVal) {
        if (!/^((13[0-9])|(15[^4,\D])|(18[0,5-9]))\d{8}$/g.test($thisVal)) {
            $('#mobile_error').html('<font color="red"> 联系电话格式不正确</font>');
            flag = false;
        } else {
            $('#mobile_error').html('');
        }
    } else {
        $('#mobile_error').html('');

    }
    return flag;
}

function checkEmail($thisVal) {
    var flag = true;
    if ($thisVal) {
        if ($thisVal.length < 5) {
            $('#email_error').html('<font color="red"> 无效的电子邮箱</font>');
            flag = false;
        } else if ($thisVal.length > 32) {
            $('#email_error').html('<font color="red"> 输入无效,电子邮箱太长</font>');
            flag = false;
        } else if (!/^\s*\w+(?:\.{0,1}[\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\.[a-zA-Z]+\s*$/g.test($thisVal)) {
            $('#email_error').html('<font color="red"> 电子邮箱格式不正确</font>');
            flag = false;
        } else {
            $('#email_error').html('');
        }
    } else {
        $('#email_error').html('');
    }
    return flag;
}

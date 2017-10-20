/**
 * 普通ajax表单提交
 * @param {Object} form
 * @param {Object} callback
 * @param {String} confirmMsg 提示确认信息
 */


function validateCallback(form, callback, confirmMsg) {
    var $form = $(form);

    if (!$form.valid()) {
        return false;
    }

    var _submitFn = function () {
        $.ajax({
            type: form.method || 'POST',
            url: $form.attr("action"),
            data: $form.serializeArray(),
            dataType: "json",
            cache: false,
            success: callback || TOP.ajaxDone,
            error: TOP.ajaxError
        });
    }

    if (confirmMsg) {
        if (confirm('confirmMsg')) _submitFn();
    }
    else {
        _submitFn();
    }

    return false;
}

/**
 * 处理div上的查询, 会重新载入当前navTab
 * @param {Object} form
 */

function divSearch(form, divId) {
    var $form = $(form);
    var json = $form.serializeArray();
    var rel = {name: 'rel', value: divId};
    json.push(rel);
    TOP.divSearch = divId;
    $.ajax({
        type: 'POST',
        url: $form.attr("action"),
        data: json,
        dataType: "html",
        cache: false,
        success: TOP.ajaxDivSearch,
        error: TOP.ajaxError
    });

    return false;
}
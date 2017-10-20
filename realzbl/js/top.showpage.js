var _showPage = {
    //跳转页面
    roadPage: function (url) {
        _showPage.showPage(true);
        window.location.href = url;
        return false;
    },

    roadDiv: function (url, json) {
        var data = $.parseJSON(json)
        TOP.divSearch = data.rel;
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: "html",
            cache: false,
            success: TOP.ajaxDivSearch,
            error: TOP.ajaxError
        })
        return false;
    },
    //显示页面
    showPage: function (bool) {
        if (bool) {
            top.$("#loading").show();
        }
        else {
            setInterval(_showPage.hidePage(), 800);
        }
    },

    //隐藏页面
    hidePage: function () {
        top.$("#loading").hide();
    }
}

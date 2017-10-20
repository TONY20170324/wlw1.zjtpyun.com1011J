(function ($) {
    $.fn.extend({
        initPage: function () {
            $(this).find('.jumppage').click(function () {
                if (!$(this).parent().find("#jump_page").val()) {
                    $(this).parent().find("#jump_page").focus();
                    return false;
                }
                var str_json = $(this).attr("data").replace('__PAGE__', $(this).parent().find("#jump_page").val());
                _showPage.roadDiv($(this).attr("href"), str_json);
                return false;
            });
        }
    })
})(jQuery);

var TOP = {
    divSearch: '',
    statusCode: {ok: 1, error: 0, timeout: 301},

    ajaxError: function (xhr, ajaxOptions, thrownError) {
        if (alertMsg) {
            alertMsg.alertError("网络超时，请稍候再试！");
        }
    },

    ajaxDone: function (json) {
        if (json.status == TOP.statusCode.error)//后端抛出
        {
            alertMsg.alertError(json.info);
        }
        else if (json.status == TOP.statusCode.timeout)//超时
        {
            alertMsg.alertMsg(json.info);
        }
        else //成功
        {
            alertMsg.alertMsg(json.info);
            _showPage.roadPage(json.url);
        }
    },

    ajaxDivSearch: function (html) {
        if (TOP.divSearch) {
            $("#" + TOP.divSearch).html(html).initPage();
        }
    }
};

/**
 * 扩展String方法
 */
(function ($) {
    $.extend(String.prototype, {

        isPositiveInteger: function () {//匹配正整数
            return (new RegExp(/^[1-9]\d*$/).test(this));
        },
        isInteger: function () {//检查是否整数
            return (new RegExp(/^\d+$/).test(this));
        },
        isNumber: function (value, element) {//是不是数字
            return (new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(this));
        },
        trim: function () {//去空
            return this.replace(/(^\s*)|(\s*$)|\r|\n/g, "");
        },
        startsWith: function (pattern) {//判断是不是pattern为开始
            return this.indexOf(pattern) === 0;
        },
        endsWith: function (pattern) {//判断是不是pattern为结束
            var d = this.length - pattern.length;
            return d >= 0 && this.lastIndexOf(pattern) === d;
        },
        replaceSuffix: function (index) {
            return this.replace(/\[[0-9]+\]/, '[' + index + ']').replace('#index#', index);
        },
        trans: function () {
            return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        },
        encodeTXT: function () {
            return (this).replaceAll('&', '&amp;').replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(" ", "&nbsp;");
        },
        replaceAll: function (os, ns) {//替换全部
            return this.replace(new RegExp(os, "gm"), ns);
        },
        replaceTm: function ($data) {
            if (!$data) return this;
            return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_]*})", "g"), function ($1) {
                return $data[$1.replace(/[{}]+/g, "")];
            });
        },
        replaceTmById: function (_box) {
            var $parent = _box || $(document);
            return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_]*})", "g"), function ($1) {
                var $input = $parent.find("#" + $1.replace(/[{}]+/g, ""));
                return $input.val() ? $input.val() : $1;
            });
        },
        isFinishedTm: function () {
            return !(new RegExp("{[A-Za-z_]+[A-Za-z0-9_]*}").test(this));
        },
        skipChar: function (ch) {//跳过字符
            if (!this || this.length === 0) {
                return '';
            }
            if (this.charAt(0) === ch) {
                return this.substring(1).skipChar(ch);
            }
            return this;
        },
        isValidPwd: function () {//匹配密码6-12位
            return (new RegExp(/^([_]|[a-zA-Z0-9]){6,32}$/).test(this));
        },
        isValidMail: function () {//匹配邮箱
            return (new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(this.trim()));
        },
        isSpaces: function () {//
            for (var i = 0; i < this.length; i += 1) {
                var ch = this.charAt(i);
                if (ch != ' ' && ch != "\n" && ch != "\t" && ch != "\r") {
                    return false;
                }
            }
            return true;
        },
        isPhone: function () {//判断是不是手机号
            return (new RegExp(/^1\d{10}$/).test(this));
        },
        isUrl: function () {//判断是不是url
            return (new RegExp(/^[a-zA-z]+:\/\/([a-zA-Z0-9\-\.]+)([-\w .\/?%&=:]*)$/).test(this));
        },
        isExternalUrl: function () {
            return this.isUrl() && this.indexOf("://" + document.domain) == -1;
        },
        initScript: function () {//注册脚本
            var regDetectJs = /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/ig;
            var jsContained = this.match(regDetectJs);
            if (jsContained) {
                var regGetJS = /<script(.|\n)*?>((.|\n|\r\n)*)?<\/script>/im;
                var jsNums = jsContained.length;
                for (var i = 0; i < jsNums; i++) {
                    var jsSection = jsContained[i].match(regGetJS);
                    if (jsSection[2]) {
                        if (window.execScript) {
                            // IE
                            window.execScript(jsSection[2]);
                        } else {
                            //
                            window.eval(jsSection[2]);
                        }
                    }
                }
            }
        }
    });
})(jQuery);

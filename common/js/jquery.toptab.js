/**
 * Copyright © 2015 浙江托普仪器有限公司 - All Rights Reserved.
 * 摘    要：表格分页封装(新增,删除,修改,查看,搜索,批量删除)
 * 作    者：zhangyc
 * 版    本: 1.2
 * 日    期：2015-06-30 上午10:30
 *
 */
(function ($) {
    var opts;
    $.fn.toptab = function (options) {
        //1阻止非表格
        //if (!this.is("table")) {
        //    return false;
        //}
        //var tableId=this.selector.substring(1);
        var defaults = {
            listURL: '',//列表查询的URL
            delURL: '',//删除的URL
            bodyElement: 'tbody',//存放内容的html元素
            customBtn: false,//自定义底部按钮(如:批量删除)
            checkBox: true,
            delBtn: true,
            pageContainer: 'pagination',
            searchElement: '',//必须与searchCallback属性配合使用,查询按钮html元素(如果页面中有按条件查询功能,这里写成: 如按钮的id='search'就填searchElement: '#search')
            searchCallback: function () {
            },//必须与searchElement属性配合使用,可代替data属性(该函数返回Ajax中的data参数)
            win_fancybox: [],//fancybox窗口大小[{element: '.edit_item',w: 520,h: 420}]
            data: {//Ajax中的data参数
                pageNo: 1,
                pageSize: 12
            },
            callback: function () {//列表查询的回调函数(该函数返回Ajax请求成功后所封装的数据;如将Ajax返回的数据封装成tr格式的数据)
            }
        };

        opts = options = $.extend({}, defaults, options || {});

        if (options.searchElement) {
            //绑定查询按钮的点击事件
            $(options.searchElement).bind('click', function () {
                $.fn.goTOPage(1, options);
            });
        }
        //默认执行列表查询
        $.fn.goTOPage(1, options);
    };

    var methods = {
        /**
         * 分页列表查询
         * @param $pageNo 当前页数
         */
        tList: function ($pageNo, options) {
            if (!opts) {
                //开发过程中,错误调用此函数时被执行
                methods.tDefArtDialog("系统出错了！");
                return;
            }
            if (!options) {
                options = opts;
            }
            //处理当前页数
            var _pageNo;
            if (arguments.length > 0 && $pageNo != undefined) {//(传参数时)
                _pageNo = $pageNo;
            } else {//(未传参数时)
                _pageNo = options.data.pageNo;
            }
            if (options.searchElement) {
                //通过调用回调函数获得查询参数
                options.data = $.extend({}, options.data, options.searchCallback() || {});
            }
            //将当前页数赋值给options.data.pageNo
            options.data.pageNo = _pageNo;

            $.ajax({
                type: "POST",
                url: options.listURL,
                data: options.data,
                dataType: "json",
                cache: false,
                success: function (page) {
                    if (page) {
                        var $list = page['list'];//接收返回的结果集
                        $(options.bodyElement).html("");//清空表格内容
                        var $tr = options.callback($list, options.data.pageNo, options.data.pageSize);//根据[结果集]通过回调函数,生成表格内容
                        $(options.bodyElement).html($tr);//填充内容到表格中
                        var $len = $list.length;
                        if ($len > 0) {
                            //if (!options.customBtn) {//默认在底部添加[批量删除]按钮
                            //    var $tdCount = $(options.bodyElement).find('tr:first td').length;
                            //    $(options.bodyElement).append("<tr><td colspan='" + $tdCount + "'><div class='pull-left'><input type='button' class='btn btn-small btn-primary permission_delete' data-align='top left' id='delete_items' value='批量删除'/></div>&nbsp;</td></tr>");
                            //}
                            //分页
                            methods.tPagination(_pageNo, page.recordCount, page.pageCount, $.fn.goTOPage, options.pageContainer, options);

                            if (!options.customBtn) {//默认在底部添加[批量删除]按钮
                                if ($('#more_del').length > 0) {
                                    $('#more_del').remove();
                                }
                                $("#" + options.pageContainer).after("<div class='pull-left' style='margin-top: 4px' id='more_del'><input type='button' class='btn btn-small btn-primary permission_delete' data-align='top left' id='delete_items' value='批量删除'/></div>");
                            }

                        } else {
                            $("#" + options.pageContainer).html("");
                            if ($('#more_del').length > 0) {
                                $('#more_del').remove();
                            }
                            //methods.tPagination(1, 1, 0, "$.fn.goTOPage", null);
                        }

                        $('#selectAll').prop("checked", false);
                        $('#delete_items').prop('disabled', true);

                        if (options.checkBox) {
                            //单个选
                            methods.tSelectOne($len);
                            //全选
                            methods.tSelectAll();
                            //删除选定项
                            methods.tDelSelected(_pageNo, $len, options);
                        }

                        if (options.delBtn) {
                            //删除单项
                            methods.tDel(_pageNo, $len, options);
                        }
                    }

                    //预生成fancybox窗口
                    var $win_count = options.win_fancybox.length;
                    for (var i = 0; i < $win_count; i++) {
                        var $element = options.win_fancybox[i].element;

                        $($element).fancybox({
                            'hideOnContentClick': false,
                            'titlePosition': 'outside',
                            'type': 'iframe',
                            'overlayColor': '#000',
                            'overlayOpacity': 0.3,
                            'transitionIn': 'elastic',
                            'transitionOut': 'none',
                            'autoDimensions': false,
                            'autoScale': false,
                            'width': options.win_fancybox[i].w,
                            'height': options.win_fancybox[i].h,
                            'padding': 0,
                            'scrolling': 'no'
                        });
                    }
                },
                error: function () {
                    methods.tError();
                }
            });
        },
        tDefArtDialog: //自定义ArtDialog的默认参数 (500毫秒内自动关闭窗口)
            function (content, fn) {
                var d = dialog({
                    content: content
                });
                d.show();//  d.showModal();
                setTimeout(function () {//定时关闭窗口
                    d.close().remove();
                    if (typeof(fn) == "function") {//执行回调函数
                        fn.call();
                    }
                }, 1000);
            },
        tDefaultArtDialog: //自定义ArtDialog的默认参数(需手动关闭窗口)
            function (content, $this) {
                dialog({
                    quickClose: true,// 点击空白处快速关闭
                    follow: $($this)[0],
                    content: content,
                    onclose: function () {
                        $($this).focus();
                    }
                }).show();//.showModal();
            },
        tTipArtDialog: //自定义ArtDialog的默认参数(需手动关闭窗口)
            function (content, $this) {
                var d = dialog({
                    //quickClose: true,
                    follow: $($this)[0],
                    content: content,
                    onclose: function () {
                        $($this).focus();
                    }
                });
                d.show();//.showModal();
                //$($this).focus();
                $($this).bind('blur', function () {
                    d.close().remove();
                });
            },
        tDel: function ($pageNo, len, options) {
            //删除
            $('.delete_item').unbind('click');
            $('.delete_item').bind('click', function () {
                var $id = $(this).parents('tr').prop('id');//获取tr的id(行数据ID)
                methods.tDelConfirm(this, $id, function () {
                    $.ajax({
                        type: "POST",
                        url: options.delURL,
                        data: {
                            "ids": $id
                        },
                        dataType: "json",
                        cache: false,
                        success: function (data) {
                            if (data && "200" == data.code) {//删除成功
                                if (len == 1) {//当前页的数据只有一行时
                                    if ($pageNo > 1) {//总页数 大于 1 时
                                        --$pageNo;//当前页 减 1
                                    }
                                }
                                methods.tDelSuccess(function () {//提示,并重新加载当前页
                                    $.fn.goTOPage($pageNo);
                                });
                            } else {
                                methods.tDelFailure();
                            }
                        },
                        error: function () {
                            methods.tError();
                        }
                    });
                });
            });
        },
        tDelSelected: function ($pageNo, len, options) {//批量删除
            var $checkedCount = 0;
            $('#delete_items').unbind('click');
            $('#delete_items').bind('click', function () {
                //获取被选中的checkbox项
                var $id = "";
                $('input[name="checkbox_item"]:checked').each(function (i) {
                    if ($id) {
                        $id += "," + $(this).val();
                    } else {
                        $id += $(this).val();
                    }
                    ++$checkedCount;
                });

                methods.tDelConfirm(this, $id, function () {
                    $.ajax({
                        type: "POST",
                        url: options.delURL,
                        data: {
                            "ids": $id
                        },
                        dataType: "json",
                        cache: false,
                        success: function (data) {
                            if (data && "200" == data.code) {//删除成功
                                if (len == 1) {//当前页的数据只有一行时
                                    if ($pageNo > 1) {//总页数 大于 1 时
                                        --$pageNo;//当前页 减 1
                                    }
                                }
                                methods.tDelSuccess(function () {//提示,并重新加载当前页
                                    $.fn.goTOPage($pageNo);
                                });
                            } else {
                                methods.tDelFailure();
                            }
                        },
                        error: function () {
                            methods.tError();
                        }
                    });
                });
            });
        },
        tSelectOne: //单个选--改变事件
            function (len) {
                $('input[name="checkbox_item"]').unbind('change');
                $('input[name="checkbox_item"]').bind('change', function () {
                    //没有全部选中,全选框设为不选中
                    if ($('input[name="checkbox_item"]:checked').length < len) {
                        $('#selectAll').prop("checked", false);
                    }

                    //一个也没有选中,禁用按钮和全选框设为不选中
                    if ($('input[name="checkbox_item"]:checked:enabled').length == 0) {
                        $('#selectAll').prop("checked", false);
                        $('#delete_items').prop('disabled', true);
                        //$('#delete_items').removeClass('button');
                    } else {
                        //启用按钮
                        $('#delete_items').prop('disabled', false);
                        //$('#delete_items').addClass('button');
                        //全部选中,全选框设为选中
                        if ($('input[name="checkbox_item"]:checked').length == len) {
                            $('#selectAll').prop("checked", true);
                        }
                    }
                });

            },
        tSelectAll: //全选--改变事件
            function () {

                $('#selectAll').unbind("change");
                $('#selectAll').bind("change", function () {
                    $('input[name="checkbox_item"]:enabled').prop("checked", $(this).prop("checked"));
                    if ($(this).prop("checked")) {
                        $('#delete_items').prop('disabled', false);
                        //$('#delete_items').addClass('button');
                    } else {
                        $('#delete_items').prop('disabled', true);
                        //$('#delete_items').removeClass('button');
                    }
                });
            },

        tErrorDialog: //自定义ArtDialog的默认参数
            function (content) {
                methods.tDefaultArtDialog(content);
            },
        tSuccess: //修改,添加成功的回调函数
            function ($id, callback, flag) {
                if (flag) {
                    methods.tDefArtDialog(($id) ? "修改成功" : "添加成功", callback);
                } else {
                    methods.tDefArtDialog(($id) ? "修改成功" : "添加成功", function () {
                        methods.tList();
                    });
                }
                $.fancybox.close();
            },
        tFailure: //修改,添加失败的回调函数
            function ($id) {
                methods.tDefArtDialog(($id) ? "修改失败" : "添加失败");
            },
        tError: //Ajax请求失败的回调函数
            function () {
                //methods.tDefaultArtDialog("抱歉!服务器繁忙，请稍后再试!");
            },
        tTimeout: //session超时的回调函数
            function () {
                dialog({
                    title: '',
                    content: '登录状态已超时,请重新登录!',
                    okValue: '确 定',
                    cancelValue: '取消',
                    close: function () {
                        top.location.href = "/login";
                    }
                    , quickClose: true// 点击空白处快速关闭
                }).show();
            },
        tDelFailure: //删除失败的回调函数
            function () {
                methods.tDefArtDialog("删除失败");
            },
        tDelSuccess: //删除成功的回调函数
            function (fn) {
                methods.tDefArtDialog("删除成功", fn);
            },
        tDelConfirm: //确认删除
            function ($this, $id, callback, $content) {
                if (!$id) {
                    methods.tDelFailure();
                } else {
                    dialog({
                        id: $id,
                        title: '',
                        content: ($content) ? $content : '确定要删除吗？',
                        okValue: '确 定',
                        align: $($this).data('align'),
                        ok: function () {
                            if (typeof(callback) == "function") {//执行回调函数
                                callback.call();
                            }
                        },
                        cancelValue: '取消',
                        cancel: function () {
                        }
                        , quickClose: true// 点击空白处快速关闭
                    }).show($this);
                }
            },
        tPagination: //设置分页组件,加上分页方法名
            function (currentPage, totalCount, totalPage, functionName, pageContainer, options) {
                if (!pageContainer) {
                    pageContainer = "";
                }

                currentPage = parseInt(currentPage);

                $("#" + pageContainer).html("");
                var $page = $("#" + pageContainer);

                $page.append("<a class='noclick font-black'>共 " + totalPage + " 页</a>");
                if (currentPage <= 1) {
                    $page.append("<a class='noclick'>&laquo;首页</a>");
                    $page.append("<a class='noclick'>&laquo;上页</a>");
                } else {
                    $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_home' " + pageContainer + "_pageIndex='1' >&laquo;首页</a>");
                    $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_prev'  " + pageContainer + "_pageIndex='" + (currentPage - 1) + "'>&laquo;上页</a>");
                }

                var temp1 = (currentPage - 4) <= 1 ? 1 : currentPage - 4;//分页组件中间显示的起始页
                var temp2 = (temp1 + 9) > totalPage ? totalPage : temp1 + 9;//页数下标个数
                if ((temp2 - temp1 + 1) < 10) {//当下标个数小于规定的个数时
                    temp1 = (temp2 - 9) <= 0 ? 1 : temp2 - 9;
                }
                for (var i = temp1; i <= temp2; i++) {
                    if (i == currentPage) {
                        $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_num" + i + "' " + pageContainer + "_pageIndex='" + i + "' class='number current'>" + i + "</a> ");
                    } else {
                        $page.append("<a href='javascript:void(0);'id='" + pageContainer + "_page_num" + i + "'  " + pageContainer + "_pageIndex='" + i + "' class='number'>" + i + "</a> ");
                    }
                }
                if (currentPage >= totalPage) {
                    $page.append("<a class='noclick'>下页&raquo;</a>");
                    $page.append("<a class='noclick'>末页&raquo;</a>");
                } else {

                    $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_next' " + pageContainer + "_pageIndex='" + (currentPage + 1) + "'>下页&raquo;</a>");
                    $page.append("<a href='javascript:void(0);' id='" + pageContainer + "_page_last'  " + pageContainer + "_pageIndex='" + totalPage + "'>末页&raquo;</a>");
                }

                $page.append("<span class='input-append'><input id='" + pageContainer + "goPage' class='span1' type='text' value='" + currentPage + "' onkeypress='return  $.fn.tKeypress();' onkeyup='$.fn.tKeyup(" + totalPage + "," + currentPage + ",\"" + pageContainer + "\")' onpaste='return false;'><button class='btn btn-goto' id='" + pageContainer + "gotoBtn' disabled type='button'>跳转</button></span><a class='noclick font-black'>记录数：" + totalCount + "</a>");
                if (totalCount == 0) {
                    $("#" + pageContainer + "goPage").val(0);
                    $("#" + pageContainer + "goPage").attr("readonly", "readonly");
                    $("#" + pageContainer + "gotoBtn").attr("disabled", "disabled");
                }

                $('a[id^="' + pageContainer + '_page_"]').each(function () {
                    $(this).unbind('click').bind('click', function () {
                        functionName($(this).attr(pageContainer + "_pageIndex"), options);
                    });
                });

                $('#' + pageContainer + "gotoBtn").unbind('click').bind("click", function () {
                    var $c_page = $('#' + pageContainer + "goPage").val();
                    functionName(($c_page) ? $c_page : 1, options);
                });
            },
        tKeypress: function () {
            var flag = event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 37 || event.keyCode == 39;
            return flag;
        },
        tKeyup: function (totalPage, currentPage, pageContainer) {

            var val = $("#" + pageContainer + "goPage").val();
            val = val.replace(/[^0-9]/g, "");
            $("#" + pageContainer + "goPage").val(val);
            val = parseInt(val);
            if (0 >= val || val > totalPage) {
                val = currentPage;
                $("#" + pageContainer + "goPage").val(val);
            }
            if (val == currentPage) {
                $("#" + pageContainer + "gotoBtn").attr("disabled", "disabled");
            } else {
                $("#" + pageContainer + "gotoBtn").removeAttr("disabled");
            }
        }
    };

    $.fn.goTOPage = function ($pageNo, $options) {
        methods.tList($pageNo, $options);
    };

    $.fn.tDefArtDialog = function ($content, fn) {
        methods.tDefArtDialog($content, fn);
    }

    $.fn.tDefaultArtDialog = function ($content, $this) {
        methods.tDefaultArtDialog($content, $this);
    }

    $.fn.tTipArtDialog = function ($content, $this) {
        methods.tTipArtDialog($content, $this);
    }

    $.fn.tDelConfirm = function ($this, $id, $content, callback) {
        methods.tDelConfirm($this, $id, $content, callback);
    }

    $.fn.tErrorDialog = function ($content) {
        methods.tErrorDialog($content);
    }

    $.fn.tSuccess = function ($id, callback, flag) {
        methods.tSuccess($id, callback, flag);
    };

    $.fn.tFailure = function ($id) {
        methods.tFailure($id);
    };

    $.fn.tError = function () {
        methods.tError();
    };

    $.fn.tTimeout = function () {
        methods.tTimeout();
    };

    $.fn.tKeypress = function () {
        methods.tKeypress();
    }
    $.fn.tKeyup = function (totalPage, currentPage, pageContainer) {
        methods.tKeyup(totalPage, currentPage, pageContainer);
    }
})(jQuery);
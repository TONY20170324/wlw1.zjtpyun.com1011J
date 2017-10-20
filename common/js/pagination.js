/**
 * Copyright(c)2013,浙江托普仪器有限公司
 * All rights reserved
 * 文件名称: pagination.js
 * 摘    要: 设置分页组件
 *             前提条件：页面中有id为pagination的div
 *             需要传入的参数：当前页数，记录总数，总页数
 * 作    者: yhq
 * 日    期：2014.09.11
 */
//设置分页组件
function setPagination(currentPage, totalCount, totalPage, pageContainer) {//add by yhq
    setPagination2(currentPage, totalCount, totalPage, "goTOPage", pageContainer);
}

//设置分页组件,加上分页方法名
function setPagination2(currentPage, totalCount, totalPage, functionName, pageContainer) {//add by yhq
    //后台传过来是string类型，不转换相加有问题：2+1 -> 21
    //var currPage = parseInt(currentPage);

    //判断参数的准确性
    if (typeof (currentPage) != "number") {//当前页数
        currentPage = 1;
    }
    if (typeof (totalCount) != "number") {//记录数
        totalCount = 0;
    }
    if (typeof (totalPage) != "number") {//总页数
        if (totalCount <= 0) {
            totalPage = 0;
        } else {
            totalPage = 1;
        }
    }

    var pageHTML = "";
    //console.log("totalCount=" + totalCount);
    pageHTML += "<a class='noclick font-black'>共 " + totalPage + " 页</a>";
    if (currentPage <= 1) {
        pageHTML += "<a class='noclick'>&laquo;首页</a>"
        + "<a class='noclick'>&laquo;上页</a>";
    } else {
        pageHTML += "<a href='javascript:" + functionName + "(1);'>&laquo;首页</a>"
        + "<a href='javascript:" + functionName + "(" + (currentPage - 1) + ");'>&laquo;上页</a>";
    }
    var temp1 = (currentPage - 4) <= 1 ? 1 : currentPage - 4;//分页组件中间显示的起始页
    var temp2 = (temp1 + 9) > totalPage ? totalPage : temp1 + 9;//页数下标个数
    if ((temp2 - temp1 + 1) < 10) {//当下标个数小于规定的个数时
        temp1 = (temp2 - 9) <= 0 ? 1 : temp2 - 9;
    }
    for (var i = temp1; i <= temp2; i++) {
        if (i == currentPage) {
            pageHTML += "<a href='javascript:" + functionName + "(" + i + ");' class='number current'>" + i + "</a> ";
        } else {
            pageHTML += "<a href='javascript:" + functionName + "(" + i + ");' class='number'>" + i + "</a> ";
        }
    }
    if (currentPage >= totalPage) {
        pageHTML += "<a class='noclick'>下页&raquo;</a>"
        + "<a class='noclick'>末页&raquo;</a>";
    } else {
        pageHTML += "<a href='javascript:" + functionName + "(" + (currentPage + 1) + ");'>下页&raquo;</a>"
        + "<a href='javascript:" + functionName + "(" + totalPage + ");'>末页&raquo;</a>";
    }

    pageHTML += "<span class='input-append'><input id='goPage' class='span1' type='text' "
    + "value='" + currentPage + "'"
    + "onkeypress='return keypress();' "
    + "onkeyup='keyup(" + totalPage + "," + currentPage + ")' onpaste='return false;'>"
    + "<button class='btn btn-goto' id='gotoBtn' disabled type='button' " +
    "onclick='" + functionName + "(document.getElementById(\"goPage\").value);'>跳转</button></span>"
    + "<a class='noclick font-black'>记录数：" + totalCount + "</a>";
    if (pageContainer) {
        $("#" + pageContainer).html(pageHTML);
    } else {
        $("#pagination").html(pageHTML);
    }
    if (totalCount == 0) {
        $("#goPage").val(0);
        $("#goPage").attr("readonly", "readonly");
        $("#gotoBtn").attr("disabled", "disabled");
    }
}

function keypress() {
    var flag = event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 37 || event.keyCode == 39;
    return flag;
}

function keyup(totalPage, currentPage) {
    var val = $("#goPage").val();
    val = val.replace(/[^0-9]/g, "");
    $("#goPage").val(val);
    val = parseInt(val);
    if (0 >= val || val > totalPage) {
        if (totalPage <= 0) {
            val = 0;
        } else {
            val = currentPage;
        }
        $("#goPage").val(val);
    }
    if (val == currentPage || val == 0) {
        $("#gotoBtn").attr("disabled", "disabled");
    } else {
        $("#gotoBtn").removeAttr("disabled");
    }
}
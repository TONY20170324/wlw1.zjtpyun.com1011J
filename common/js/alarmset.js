/**
 * Created by Administrator on 14-12-27.
 */
function validate()
{
     $('#dsForm').validationEngine('detach');
    jQuery('#dsForm').validationEngine({
        showOneMessage: true,
        //addPromptClass: 'formError-noArrow formError-text',
        promptPosition: 'topLeft',
        maxErrorsPerField: 1,
        scroll:false,
        onValidationComplete: saveSet
    });
}
var terminalId = 0;
/**
 * 比较上下限值
 * @param field
 * @param rules
 * @param i
 * @param options
 * @returns {jQuery.validationEngineLanguage.allRules.LowGreaterUp.alertText|*}
 */
function compareUpLow(field, rules, i, options)
{
    var lowVal=parseInt($("#txtLowVal").val());
    var upVal=parseInt($("#txtUpVal").val());
    //console.log("lowVal:"+lowVal+ ">upVal:"+ upVal+"  ="+(lowVal > upVal))
    if (lowVal > upVal) {
        return options.allrules.LowGreaterUp.alertText;
    }
    return false;
}
/**
 * 保存报警设置
 */
function saveSet(form, status)
{
    if(!terminalStatus)
    {
        $("#msg").html("当前终端网络断开,不能设置报警值!");
        shake($("#msg"), " text-green", 6);
        $.fancybox.close();
        return false;
    }
    var lowVal=$("#txtLowVal").val();
    var upVal=$("#txtUpVal").val();
    var capIntv=$("#txtCapIntv").val();
    var deviceId=$("#hdDeviceId").val();
  //  alert(status)
    if(status==true) {
        $.ajax({
         url: "/station/sensor/set",
         data: {upVal: upVal, lowVal: lowVal,capIntv:capIntv, deviceId: deviceId,terminalId: terminalId},
         type: "post",
         dataType: "json",
         cache:false,
         success: function (data) {
             if(data.code==1) {
                 $("#msg").html(data.message);
                 shake($("#msg"), "text-green", 20);
                 setTimeout(function(){
                     $.fancybox.close();
                 },2000)
             }else{
                 shake($("#msg"), "text-green", 6);
                 $("#msg").html(data.message);
                 //  art.dialog.tips(data.message, 2);
             }
         }
         });
    }
    return false;
}

function bindFancybox()
{
    $("a.dataset").each(function(){
        var that= $(this);
        that.fancybox({
        'titlePosition': 'outside',
        'overlayColor': '#000',
        'overlayOpacity': 0.3,
        'transitionIn': 'elastic',
        'transitionOut': 'elastic',
        'autoDimensions': false,
        'width': 567,
        'height': 300,
        'padding': 0,
        'scrolling': 'no',
        onComplete:function()
        {
            setInputStatus(0);
            var deviceId=that.attr("deviceId");
            var title=that.attr("title");
            var tName=$("#terminalList").find("option:selected").text();
            $("#dataSetTitle").html(tName + " "+title);
            $("#hdDeviceId").val(deviceId);
            $.ajax({
                url: "/station/sensor",
                data: {deviceId: deviceId},
                type: "get",
                dataType: "json",
                cache:false,
                success: function (data) {
                    if(data.code==1) {
                        var d=data.data;
                        $("#txtLowVal").val(d.sensor.lowVal);
                        $("#txtUpVal").val(d.sensor.upVal);
                        $("#txtCapIntv").val(d.sensor.capIntv);
                        setInputStatus(1);
                    }
                }
            });

            validate();
        },
        onClosed:function()
        {
            $("#msg").html("");
            jQuery('#dsForm').validationEngine("hideAll");
        }
    });
    })
}
/**
 * 文字或边框等的样式变换
 * @param ele 容器的对象
 * @param cls 要变化的样式
 * @param times 闪烁时间
 */
function shake(ele, cls, times) {
    var i = 0, t = false, o = ele.attr("class") + " ", c = "", times = times || 2;
    if (t) return;
    t = setInterval(function () {
        i++;
        c = i % 2 ? o + cls : o;
        ele.attr("class", c);
        if (i == 2 * times) {
            clearInterval(t);
            ele.removeClass(cls);
        }
    }, 200);
};
/**
 * 设置输入框的是否可用的状态
 * @param flag 1可用 0不可用
 */
function setInputStatus(flag)
{
    if(flag) {
        $("#txtUpVal").removeAttr("readonly");
        $("#txtLowVal").removeAttr("readonly");
        $("#txtCapIntv").removeAttr("readonly");
        $("#btnset").removeAttr("disabled");
        $("#btnset").html("确定");
    }else{
        $("#txtUpVal").attr("readonly","readonly");
        $("#txtLowVal").attr("readonly","readonly");
        $("#txtCapIntv").attr("readonly","readonly");
        $("#btnset").attr("disabled","true");
        $("#btnset").html("loading");
    }
}

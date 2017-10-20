/**
 * Created by lxd on 15-5-25.
 * am帮助类，提取共用js。
 */

function flashArrow(){

    AM.ready(function() {
        $(window).trigger("resize");
        //兼容ieS
        glo.reBind();
        //刷新箭头
        App.init_arrow();
        if(type!=7){
            bindFancybox();
        }
        var index = $("body").data("fp-index")
        if(index==undefined){
            index=parseInt(1);
        }
        if(parseInt(pageCount)>parseInt(pageNum) && parseInt(pageNum)==parseInt(index)){
            pageNum = parseInt(pageNum)+parseInt(1);
            //getAllSensor(type)
            getAllDevice(type);
        }
    })
}

function nextArrow(){
    //获取的是点击箭头的那个页面的页数，点完后的才是下一页。
    var index = $("body").data("fp-index");
    if(index==undefined){
        index=parseInt(1);
    }
    if(parseInt(pageCount)>parseInt(pageNum) && parseInt(pageNum)-parseInt(1)==parseInt(index)){
        pageNum = parseInt(pageNum)+parseInt(1);
        //getAllSensor(type)
        getAllDevice(type);
    }
}
//绑定箭头
$('body').on("click",'.down',function(){
    nextArrow();
})

AM.ready("init2","component","mousewheel", function(){
    // TODO Page Code...
    App.hoverToggle({'.img-con img':'active'})
},function(){
    glo.ini();
})

glo = window.glo || {}
glo.ini = function(){
    App.init_arrow();
    $("#band8").html("");

    getAllDevice(type);
    initflag = true;


    var is_finish = true;
    var is_up_finish = true;
    var wheelTime=300;
    AM.ready('mousewheel', function(){
        $('[data-toggle=fullpage]').on('mousewheel', function(e, delta){
            if(is_finish && delta<0){
                glo.nextPage();
            }
            if(is_up_finish && delta>0){
                glo.prePage();
            }
            return false;
        })
    });

    glo.nextPage=function(){
        is_finish=false;
        downPage();
        nextArrow();
        setTimeout(function(){
            is_finish=true;
        }, wheelTime)
    }

    glo.prePage=function(){
        is_up_finish=false;
        upPage();
        setTimeout(function(){
            is_up_finish=true;
        }, wheelTime)
    }

}
//  清除band
glo.clearBand = function()
{
    $.fn.fullpage.moveTo(1);
    $("#band8").off("scroll");
    $("body").data("fp-index",1);
    $("#band8").html("").attr("class","").attr("style","");
}
// 重建band
glo.reBuildBand = function(){
    glo.fullpage && glo.fullpage();
    glo.reBind();
}

// 新建元素重新绑定事件
glo.reBind = function () {
    AM.ready("bootstrap.min",function(){
        // fixed item4 layout in IE
        App.ie && $(".item4:nth-child(4n)").css({'margin-right': '-12px', 'position': 'relative', 'right': '0px'})
        // init popover
        $('[data-toggle="popover"]').popover({
            trigger: "hover"
        })

        // hover change
        App.hoverToggle({'.data-qixiang': 'data-qixiang-hover'})
    })

}

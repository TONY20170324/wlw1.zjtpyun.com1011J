AM.ready("component","bootstrap.min","nicescroll",function(){
         App.debug = function(a){
            if($("#w-width").length < 1) {
                $("<div>").attr("id","w-width").css({
                    "position":"fixed",
                    "top":5,
                    'left':5,
                    'color':'#fff',
                    'z-index':9999
                }).appendTo($("body"));
            } 
            a == 'hide' &&  $("#w-width").fadeOut(1500);
            a != 'hide' &&  $("#w-width").html(a);
        }
        //  for IE 
        App.ie && $("html").addClass("iecss");

        // fixed item4 layout in IE
        App.ie && $(".item4:nth-child(4n)").css({'margin-right':'-12px','position':'relative','right':'0px'})

        // DPI 1366 * 768(655)    当前最低高度要求 785 最低宽度要求 1300
        !(function(){
            var w = $(window);
            var b = $("body");
            var a = function(){
                var h = w.height();
                var _w = w.width();
                $('html,body').css({'min-width':'1200px'})
                if(_w < 1310){$('body').css('width','1310px');} else {$('body').css('width','auto');}                
                if(_w < 1310) {$("#band8,#neck-box,#moni-con,#site-list").css("margin-left","55px")} else {$("#band8,#neck-box,#moni-con,#site-list").css("margin-left","auto")}
                if(h<789){b.addClass('dpi-1366');} else {b.removeClass("dpi-1366");}                
            }            
            a();
            
            w.resize(function(){a();})
        })()
            

        // init selectBox
        App.selectBox($(".client-list"),{isSlide:true,callback:function(obj){
            // 点击终端后 这里可以继续操作  obj为点击的对象            
        }})     
        


        // init popover
         $('[data-toggle="popover"]').popover({
            trigger:"hover"
         })

        // hover change
        App.hoverToggle({'.data-qixiang':'data-qixiang-hover'})

        // 模拟 hover 事件
        $("body").on("mouseenter mouseleave",'[hover]',function(){
            var t = $(this);
            var c = t.attr('hover');
            var _tar = t.attr('target');
            var tar = _tar;
            var next_flag = false;
            if(/next/.test(tar)){
                next_flag = true;
                tar.replace('/next/',"");
                tar = t.next();
            }   
            if(!tar) tar = t;
            var cname = $(tar).attr('class');
            var n = new RegExp(c);

            if(n.test(cname))  $(tar).removeClass(c);
            else {
                if(next_flag){
                    $(tar).on("mouseleave",function(){
                        $(tar).addClass(c);
                    })
                }
                else $(tar).addClass(c);
            }
            // 目前有个BUG 从[hover]移开 但不进入_tar 无法触发实践
            // $(":not([hover],_tar)").on("mouseenter",function(e){                
            //     if(n.test(cname))  $(tar).addClass(c);
            //     else $(tar).removeClass(c);
            //     console.log('123');
            //     $(":not([hover],_tar)").off("mouseenter");
            // })

        })
        


        // menubar init
        //$("body").on('hover','#menubar',function(){
        //    $("body").toggleClass('menubar-visible');
        //    nano_check();
        //})

        $("body").on('mouseenter','#menubar',function(){
            $("body").addClass('menubar-visible');
        })
        $("body").on('mouseleave','#menubar',function(){
            $("body").removeClass('menubar-visible');
        })

    function nano_check(){
            if(/visible/.test($('body').attr('class'))){
                $("#menubar .nano-pane").show()
            }
            else
            {
                $("#menubar .nano-pane").hide()
            }
        }

        // 给Modal的close绑定关闭事件
        $("body").on("click",".close",function(){
            $(".win").remove();
            $(".nicescroll-rails").remove();
        })
        $("body").on("click","[role=close]",function(){
            $(".win").remove();
            $(".nicescroll-rails").remove();
        })


        // 给Modal添加移动事件   存在一些bug  暂时不执行该函数
        // $("body").on("hover",'#win-modal',function(){            
        //     $("#win-modal").jqDrag(".tp-panel-header");
        //     $(".nicescroll-rails").remove();
        // })

        // 添加历史返回事件
        $("[data-role=back]").on("click",function(){
            window.history.go(-1);  //返回并且刷新上个页面
        })



        // Tab 事件 切换
        if($("[data-toggle=tab]").length > 0) {
            $("[data-toggle=tab]").on("click",function(){
                $("[data-toggle=tab]").removeClass('on');
                $(this).addClass("on");
                $("[data-role=tab-page]").hide();                    
                $($(this).data('target')).slideDown();
            })            
        }
            

        // 使用niceScroll
        $("html").niceScroll({
            cursorcolor:"#cfcfcf",  
            cursoropacitymax:1,  
            touchbehavior:false,  
            cursorwidth:"10px",  
            cursorborder:"0",  
            cursorborderradius:"10px"
        });
        

        // 弹出框展示
        if($("[data-toggle=showWin]").length > 0 || $("body").data('showWin') == true) {            
            AM.ready('showWin',function(){
                $("body").on("click","[data-toggle=showWin]",function(){
                    var width = $(this).attr("data-width") ? $(this).attr("data-width") : $(window).width() * 0.8;
                    
                    App.win({
                        id:'win-modal',   //可控制样式 
                        title:"配置",         
                        mask:1,
                        width:width,
                        content_only:1,
                        button:0,   
                        post:false,    
                        loading:{
                            url:$(this)[0].href || $(this).attr("data-remote"),
                            callback:function(e){
                                var w = $(e).width(); win = $('.win-mod');                            
                                win.css({                                
                                    width: w +"px",
                                    top:"100px",
                                    left: $(window).width()/2,                                
                                    marginLeft: -w/2
                                })             
                                return e;
                            } 
                        }
                      });
                    return false;
                })
            })
        }


        // menubar
        if($('body').data('menubar-xh')) {
            var html = '<div id="menubar" class="menubar-inverse animate">    <div class="menubar-scroll-panel" style="height:100%; overflow:hidden;">        <div class="bg-mask"></div>        <ul id="main-menu">            <li class="gui-folder">                <div class="gui-icon"><i class="fa fa-map-marker"></i>基地</div>                <span class=" title m-header"><i class="fa fa-map-marker"></i> 基地管理</span>               <div class="nano"> <ol>                    <li><a class="active" href="#" >杭州西湖区数字科技软件园站</a></li>                                    <li><a href="#" >湖州站</a></li>                    <li><a href="#" >宁波站</a></li>                    <li><a href="#" >义乌站</a></li>                </ol></div>            </li>        </ul>    </div></div>';
            $('body').append(html);

            // 侧边栏添加滚动条
            !function(){
                var a = function(){
                    var m = $("#main-menu ol"), h = $(window).height() - 55 - 51;
                    m.height(h);
                    $(".gui-folder").height(h+50);
                    App.nanoScroller('.nano','.nano ol',function(){
                        
                        $("#menubar .nano-slider").on("mousedown",function(){                              
                             $("body").off('hover','#menubar');
                        })
                        $("body").on("mouseup","#menubar,#band8,#neck-box,#header",function(){  
                            var id = $(this).attr("id");
                            id != 'menubar' && $("body").removeClass('menubar-visible'); 
                            nano_check();
                            $("body").on('hover','#menubar',function(){
                                $("body").toggleClass('menubar-visible'); 
                                nano_check();
                            })

                        })
                     

                    })
                }              
                $(window).on('resize',function(){a()})
                a();
            }() 
        }

        // tip-menu
        if($("[data-toggle=tip-menu]").length > 0) {
            $("[data-toggle=tip-menu]").each(function(e){
                var that = $(this);
                var token = that.data("token");                
                var tipMenu = $("<div>").addClass('tip-menu hide');    
                var inner = $('<a href="qixiang.php?'+token+'" class="m1"><i class="icon icon-01"></i>气象类</a><span class="divider"></span><a href="turang.php?'+token+'" class="m2"><i class="icon icon-02"></i>土壤类</a>').appendTo(tipMenu);
                tipMenu.appendTo(that);
                that.on("hover",function(){
                    $(this).find(".tip-menu").toggleClass("hide") ;
                })  
                that.find('a').each(function(){
                    var that2 = $(this);
                    that2.hover(function(){
                        $(this).toggleClass('active');
                    })
                })
            })
        }

        // data-picker
        if($("[data-role=datepicker]").length > 0){
            AM.ready('datepicker',function(){
               $("[data-role=datepicker]").each(function(){
                    $(this).datepicker({
                        format: 'yyyy-mm-dd',                
                        weekStart:1,
                        todayBtn:1,
                        autoclose:1,
                        todayHighlight:1,
                        startView:2,
                        minView:2,
                        forceParse:0
                    });
                }) 
           })  
        }

         

            
                

        // 全屏
        if($('[data-toggle=fullpage]').length>0){
            
            AM.ready("fullPage",function(){   
            // console.log('fullPage');
            !function(){
                var a = function(){
                    $('[data-toggle=fullpage]').fullpage({                              
                        scrollOverflow: false,             
                        recordHistory: true,                 
                        scrollbar:true,       
                        animateAnchor:true,    
                        normalScrollElements:".nano,.win",
                        responsive:true,
                        // 初始化时候触发
                        afterRender:function(){
                          App.init_arrow();    
                          var index = $('body').data('fp-index');
                          $(".up").hide();

                          $(window).resize(function(){
                            App.init_arrow();
                          })
                        },
                        // 可以ajax加载数据 填充页面
                        afterLoad:function(link,index){
                            if($(this).attr("loaded") == 'done'){
                                return;
                            }
                            var section = $(this);
                            if(index == 1){$(".up").hide()} else{$(".up").show()}
                            if(index == $(".section").length || $(".section").length < 2){$(".down").hide()} else {$(".down").show()}      
                            $("body").data("fp-index",index);                        
                        }
                    });
                }
                a();
                $(window).on("resize",function(){
                    var h = $(window).height();

                    if(h < 568){
                      $.fn.fullpage.destroy();  
                      // console.log("destroy");
                      $("html").css("overflow",'hidden');
                    } else {
                        // 清理fp-table
                        $(".fp-tableCell").each(function(){
                            var m = $(this),n = m.html();x = m.parent('.sa-lay');
                            m.remove(); $(n).appendTo(x);                           
                        })

                        a();
                        // $.fn.fullpage.reBuild();    
                    }
                })
                    
            }()             
                    
                
                
                
                


                    

               

            })
        };

        // chart
        if($('[role=flot]').length > 0) {

            // $("[role=flot]").each(function(index){
            //     var a = $(this).parent();
            //     a.html(" ");
            //     var html=$('<div class="panel-charts" role=\'chart\' fp-chart=\'\' fp-source=\'\' fp-y-label="值(℃)" fp-tip-label="温度值" ></div> ');
            //     html.attr('fp-chart','{"22:00":14,"23:00":18,"00:00":20,"01:00":23,"02:00":27,"03:00":26}');
            //     html.appendTo(a);
            // })

            // demo 
            var i = 1000;
            $("[role=flot]").each(function(index){
                // if(index != 0){
                //     $(this).html("暂无数据").css("background","none").css("text-align","center").css("vertical-align","middle");
                //     return;
                // }
                var chart = $(this)            
                
                // var data = {"22:00":14,"23:00":18,"00:00":20,"01:00":23,"02:00":27,"03:00":26};
                var  data = {};
                eval("data="+chart.attr("fp-chart"));
                var opt = {                
                    data : data || {} ,                           //图表数据 
                    source  : chart.attr("fp-source") || "",      //ajax数据
                    mode : chart.attr("fp-mode") || "categories", //图表模式
                    ylabel:chart.attr("fp-y-label") || "",        //Y轴显示标题
                    tip  : chart.attr("fp-tip-label") || ""
                }      
                i = i+ 1000;
                setTimeout(function(){
                    App.chart(chart,opt);                    
                    chart.css("background","none");
                },i)
            })

        }

       

        window.$ = $;

        
                
            
            
})
        
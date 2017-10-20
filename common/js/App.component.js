/*
 *@Description: App.component.js
 *@Version:	    v1.2
 *@Author:      GaoLi
 *@Update:      ghy(2012-06-1 16:30)
 */
(function (global, undefined) {// 防止undefined被污染
        var $ = global.$ || jQuery, app = {
        // browser
        ie: $.browser.msie,
        ie6: $.browser.msie && $.browser.version < 7,
        ie7: $.browser.msie && $.browser.version < 8,

        /**
         * Get cookie
         * @ param
         * @ return
         */
        getCookie: function(name) {
            var cookie_start = document.cookie.indexOf(name);
            var cookie_end = document.cookie.indexOf(";", cookie_start);
            return cookie_start == -1 ? '' : unescape(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
        },

        /**
         * Set cookie
         * @ param
         * @ return
         */
        setCookie: function(cookieName, cookieValue, seconds, path, domain, secure) {
            var expires = null;
            if (seconds != -1) {
                expires = new Date();
                expires.setTime(expires.getTime() + seconds);
            }
            document.cookie = [
                escape(cookieName),
                '=',
                escape(cookieValue),
                (expires ? '; expires=' + expires.toGMTString() : ''),
                (path ? '; path=' + path : '/'),
                (domain ? '; domain=' + domain : ''),
                (secure ? '; secure' : '')
            ].join("");
        },

        /**
         * hoverToggle
         * @ param jqueryObject {#object classname}
         * @ return
         */
        hoverToggle: function(object) {
            $.each(object, function(obj, name) {
                $(obj).hover(function() {
                    $(this).addClass(name);
                }, function() {
                    $(this).removeClass(name);
                })
            })
        },


        /**
         * placeholder
         * @ param  config(json)
         * @ return
         */
        placeholder: function(options) {
            if (('placeholder' in document.createElement('input'))) return;
            if (typeof options === 'string'||options instanceof jQuery)  options = {obj:options }; //options
            options = $.extend({}, {obj:''}, options);
            var $placeholder;
            $placeholder = (!!options.obj) ? $(options.obj).filter('[placeholder]') : $('[placeholder]');
            $placeholder.focus(
                function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder'))input.removeClass('placeholder').val('');
                }).blur(
                function () {
                    var input = $(this);
                    if (input.val() == '' || input.val() == input.attr('placeholder'))input.addClass('placeholder').val(input.attr('placeholder'));
                }).blur();
            $placeholder.parents('form').submit(function () {
                $('[placeholder]', this).each(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder'))input.val('');
                });
            });
        },

        
        getCache:function(key) {
            return this.cache.data(key);
        },
        setCache:function(key, value) {
            if (!app.cache)app.cache = $("<div>");
            this.cache.data(key, value);
            return value;
        },

        /**
         * default for dl-dt-dd
         * @param trig
         * @param options
         */
        selectBox:function(trig, options) {
            var target = trig.find("dd");            
            var t = $.trim(target.html());            
            options = $.extend({target:target, event:"click",callback:null, show:["show", "hide"], slide:["slideDown", "slideUp"], isSlide:false}, options);
            target = options.target;
            trig.each(function(index, callback) {
                var that = $(this);
                that.data("target", target.eq(index));
                if (options.isSlide)options.show = options.slide;
                if (options.event === "hover") {
                    that.hover(function() {
                        var _obj = that.find("dd"), _objWidth = that.width() + 8, _setWidth = _obj.width();
                        if (_objWidth > _setWidth) that.find("dd").width(_objWidth);
                        if ( t == "" ) {
                            showForSB(options, $(this), true);
                        }else {
                            showForSB(options, $(this), false);
                        }
                    }, function () {
                        showForSB(options, $(this), true);
                    });
                }
                else if(options.event === "click")
                {
                    that.click(function() {
                        if(true)
                        {
                            var _obj = that.find("dd"), _objWidth = that.width() + 8, _setWidth = _obj.width();
                            if (_objWidth > _setWidth) that.find("dd").width(_objWidth);
                            if ( t == "" ) {
                                showForSB(options, $(this), true);
                            }else {
                                showForSB(options, $(this), false);
                            }
                        } else {
                            showForSB(options, $(this), true);
                        }
                            
                    })
                        
                }
                if (options.fn) {                    
                    options.fn(that, that.data("target"));
                } else {

                    that.find("a").click(function (ev) {
                        that.find("dt").html(this.innerHTML);
                        if(options.callback) options.callback($(this),$(this).html());
                        showForSB(options, that, 1);
                        ev.stopPropagation();
                        return false;
                    }); 
                }
                trig.on('mouseleave',function(){
                    target.slideUp();
                })
               
                
            });
            function showForSB(options, c, n) {
                c.data("target")[options.show[n ? 1 : 0]]();
            }
        },

        /**
         * Registers module
         * @param mods {Object}
         * @param cover {string}
         */
        add : function(mods, cover) {
            if (cover === undefined) cover = true;
            for (var i in mods) {
                if (cover || !(i in this)) this[i] = mods[i];
            }
            return this;
        },
        // 初始化 上下箭头
        init_arrow: function (obj)
        {
            $(".up").remove();
            $(".down").remove();
            var html = '<a class="up" href="javascript:void(0)"></a><a class="down" href="javascript:void(0)"></a>';
            $(html).appendTo($('body'));

            $(".down").on("click",function(){
                $.fn.fullpage.moveSectionDown();                    
                // _handle_move($('body').data('scrollIndex')+1);
            })
            $(".up").on("click",function(){
                $.fn.fullpage.moveSectionUp();
                // _handle_move($('body').data('scrollIndex')-1);
            })

            var index = $("body").data("fp-index");
            if(index==undefined || index == 1 || $(".section").length==1){$(".up").hide()} else{$(".up").show()}
            if(index == $(".section").length || $(".section").length<2){$(".down").hide()} else {$(".down").show()}      
            

            var _w = $(window).width() / 2 -30;
            _w = Math.max(_w,570);
            $(".up").css("left",_w+"px");
            $(".down").css("left",_w+ "px");            
        },

        // obj是table的容器 必须设定宽度 否则失效  config为nicescroll的配置
        scrollTable : function(obj,config,callback){         
            var l = 0, t = $(obj);
            t.css({
                width:'1158px',
                'margin-left':"20px",
                'padding':"0pxs"
            })
            t.find("table th").each(function(i){                
                l = parseInt($(this).attr('width')) + l;
            })  
            var css = {
                'width':Math.max(l,1158)+"px",
                'height':'auto',
                'border-bottom':'1px solid #d5d5d5'
            }
            var x = $("<div>").css(css); 
            var m = t.find('table');
            m.clone().css(css).appendTo(x); x.appendTo(t);;
            m.remove();

            // t.find('table').css(css);
            
            var opt = {
                cursorcolor:"#339933",  
                cursoropacitymax:1,  
                touchbehavior:false,  
                cursorwidth:"5px",  
                cursorborder:"0",  
                cursorborderradius:"5px",
                railVertical:false
            }
            $.extend(true, opt, config);
            AM.ready('nicescroll',function(){
                t.niceScroll(opt);
            })
            if(callback) callback();
        },
        // 新增nanoscroller
        nanoScroller : function(obj,content,callback){
            $(obj).addClass("nano"),
            $(content).addClass("nano-content");
            AM.ready('nanoscroller','nanoscroller.css',function(){
                $(obj).nanoScroller({
                        preventPageScrolling:true,
                        alwaysVisible:true
                });

                if(callback) callback();
            })
                
            
        }

         
        


    };

 

    // App && home
    global.App = $.extend(global.App||{}, app);
    

    // ready component
    for (var key in app) {        
        AM.setMods(key, false);
    }
    
    // jquery len
    $.fn.extend({
        len:function(){
            var str = $.trim($(this).val());
            return str.length + str.replace(/[^\u4E00-\u9FA5]/g, '').length;
        }
    });

    // IE Hack
    if(App.ie)
    {
        $("body").addClass("iecss");
    }
 })(window);
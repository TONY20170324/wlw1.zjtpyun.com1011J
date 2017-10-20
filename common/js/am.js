/**
 * @Description: App Manager
 * @Version:     v0421 
 * @Author:      AliBob
 * @Modified:    2015-04-29
 * @update:      AM要求jquery的版本不能低于1.9.1
 */
 

/*!
 *
 * 获取当前文档所在路径
 */
;(function(exports){
    var doc = exports.document,
        a = {},
        expose = +new Date(),
        rExtractUri = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/,
        isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;
    exports.getCurrAbsPath = function(){
        // FF,Chrome
        if (doc.currentScript){
            return doc.currentScript.src;
        }

        var stack;
        try{
            a.b();
        }
        catch(e){
            stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
        }
        // IE10
        if (stack){
            var absPath = rExtractUri.exec(stack)[1];
            if (absPath){
                return absPath;
            }
        }

        // IE5-9
        for(var scripts = doc.scripts,
            i = scripts.length - 1,
            script; script = scripts[i--];){
            if (script.className !== expose && script.readyState === 'interactive'){
                script.className = expose;
                // if less than ie 8, must get abs path by getAttribute(src, 4)
                return isLtIE8 ? script.getAttribute('src', 4) : script.src;
            }
        }
    };
})(window)


var AM;

!function(exports) {

    AM = exports.fn.use;
    AM.add = exports.fn.add;
    AM.ready = exports.fn.ready;
    AM.delay = exports.fn.delay;
    AM.setMods = exports.util.setMods;
    
    AM(function() {
        var mods = [                
                // {mod: 'swfupload', reqs: ['swfupload', 'swfupload.queue', 'fileprogress', 'handlers'], file: '/swfupload/'},                 
                // {mod: 'swfupload.photo', reqs: ['swfupload.photo', 'swfupload.queue.photo', 'fileprogress.photo', 'handlers.photo'], file: '/swfupload/'},
                {mod:'nanoscroller',reqs:['nanoscroller.css'],file:'/nanoscroller/'},
                {mod:'fancybox',reqs:['fancybox.css'],file:'/fancybox/'},
                {mod:'validate',reqs:['validate.css'],file:'/validate/'},
                {mod:'perfectscrollbar',reqs:['perfectscrollbar.css'],file:'/perfectscrollbar/'},
                {mod:'editor',reqs:['themes/default/default.css'],file:'/editor/'}
            ];
            
        var i, j, mod, reqs, req;
            
        for (i = 0; mod = mods[i]; i++) {
            reqs = mod.reqs || [];
            
            if (reqs.length) {
                for (j = 0; req = reqs[j]; j++) { 
                    if(/.css/.test(req)) AM.add(req, {path: [exports.data.base, mod.file || '', req].join(''), type: 'css'});
                    else AM.add(req, {path: [exports.data.base, mod.file || '', req, '.js'].join(''), type: 'js'});
                }

            }
            
            AM.add(mod.mod, {path: [exports.data.base, mod.file || '', mod.name || mod.mod, '.js'].join(''), type: 'js', requires: reqs});
        }
    });
    
}((function() {
    
    var AM = {};
    AM_Config = window.AM_Config || {};
    var src = getCurrAbsPath();

    if(!AM_Config.baseUrl)
    {         
        AM_Config.baseUrl = src.replace(/\/am\.js/, '');
    }

    /**
     * data
     * @type {Object}
     */
    AM._data = {
    
        base: AM_Config.baseUrl,
        
        root: AM_Config.baseUrl.replace(/\/js/, ''),
    
        version: AM_Config.baseVersion || '',
        
        jsFiles: document.getElementsByTagName('script'),
        
        isReady: false,

        loaded: {},

        loadingQueue: {},

        readyList: [],

        globalList: [],
        
        config: {
        
            autoLoad: true,
            
            coreLib: [],
            
            mods: {}
            
        }
    
    };

    /**
     * util
     * @type {Object}
     */
    AM._util = {};

    /**
     * fn
     * @type {Object}
     */
    AM._fn = {};
    
    !function(data, util) {
    
        var mods = data.config.mods,
            core = data.config.coreLib,
            global = data.globalList;        
       
        /**
         * isUrl
         * @param  {String} url
         * @return {Boolean}
         */
        util.isUrl = function(url) {
            return /^(https|http).*$/gi.test(url);
        };
    
        /**
         * isArray
         * @param  {Array} e
         * @return {Boolean}
         */
        util.isArray = function(e) {
            return e.constructor === Array;
        };
        
        /**
         * setMods
         * @param  {String} key
         * @param  {Object} val
         */
        util.setMods = function (key, val) {
            mods[key] = val;
        };

        /**
         * getMods
         * @param  {String} key
         * @return {Object}
         */
        util.getMods = function (key) {
            return mods[key];
        };
        
        /**
         * addCore
         * @param  {String} url
         */
        util.addCore = function (url) {
            core.push(url);
        };
        
        /**
         * addGlobal
         * @param  {String} url
         */
        util.addGlobal = function(url) {
            global.push(url);
        };
        
        /**
         * compile
         * @param  {Array} arr
         * @return {Array}
         */
        util.compile = function(arr) {
            var rjs = /\.js$/,
                rroot = /^\$/,
                i, item, name, file;
            
            for (i = 0; item = arr[i]; i++) {
                var _item = item;

                if (typeof item === 'string' && !util.isUrl(item)) {
                
                    if (util.getMods(_item) !== undefined) {
                        continue;
                    }
                    
                    item = item.replace(rjs, '');
                    
                    if (item.split('/').length > 1) {
                        name = [item, 'js'].join('.');
                    } else {
                        item = item.split('.');
                        name = item.pop();
                        name = [item.length ? item.join('.') : 'App', name, 'js'].join('.');
                    }
                    
                    file = [data.base, '/', name, data.version];
                    
                    if (rroot.test(name)) {                        
                        file[0] = data.root;
                        file[2] = file[2].replace(rroot, '');
                    }
                    
                    file = file.join('');

                    util.setMods(_item, {path: file, type: 'js'});
                    
                }
            }
            
            return arr;
        };
        
    }(AM._data, AM._util);
    
    !function(data, util, fn) {
    
        var _doc = document,

            _win = window,
        
            _Queue = function(e) {
                if (!e || !util.isArray(e)) {
                    return;
                }

                this.queue = e;
                this.current = null;
            };  
            fn.prototype = window;           

        _Queue.prototype = {

            _interval: 10,

            start: function() {
                var o = this;
                this.current = this.next();

                if (!this.current) {
                    this.end = true;
                    return;
                }

                this.run();
            },

            run: function() {
                var o = this, mod, currentMod = this.current;

                if (typeof currentMod === 'function') {
                    currentMod();
                    this.start();
                    return;
                } else if (typeof currentMod === 'string') {
                    if (data.config.mods[currentMod]) {
                        mod = data.config.mods[currentMod];                        
                        fn.load(mod.path, mod.type, mod.charset, function(e) {
                            o.start();
                        }, o);
                    } else if (/hm.baidu.com\/h\.js/i.test(currentMod)) {
                        fn.load(currentMod, 'js', '', function(e, o) {
                            o.start();
                        }, o);
                    } else if (/\.js/i.test(currentMod)) {
                        fn.load(currentMod + data.version, 'js', '', function(e, o) {
                            o.start();
                        }, o);
                    } else if (/\.css/i.test(currentMod)) {

                        fn.load(currentMod + data.version, 'css', '', function(e, o) {
                            o.start();
                        }, o);
                    } else {
                        this.start();
                    }
                }
            },

            next: function() { 
                return this.queue.shift(); 
            }
        };
        
        fn.fire = function() {
            data.isReady = true;            
            if (data.readyList.length > 0) {
                fn.use.apply(this, data.readyList);
                data.readyList = [];
            }
        };
    
        fn.load = function(url, type, charset, cb, context) {

            var refFile = data.jsFiles[0];

            if (!url) {
                return;
            }
            
            if (data.loaded[url]) {
                data.loadingQueue[url] = false;
                if (cb) {
                    cb(url, context);
                }
                return;
            }
            
            if (data.loadingQueue[url]) {
                setTimeout(function() {
                    fn.load(url, type, charset, cb, context);
                }, 1);
                return;
            }

            data.loadingQueue[url] = true;

            var n, t = type || url.toLowerCase().substring(url.lastIndexOf('.js') + 1);

            t = t.replace(data.version, '');

            if (t === 'js') {
                n = _doc.createElement('script');
                n.setAttribute('type', 'text/javascript');
                n.setAttribute('src', url);
                n.setAttribute('async', true);
            } else if (t === 'css') {
                n = _doc.createElement('link');
                n.setAttribute('type', 'text/css');
                n.setAttribute('rel', 'stylesheet');
                n.setAttribute('href', url);
                data.loaded[url] = true;
            }

            if (charset) {
                n.charset = charset;
            }

            if (t === 'css') {
                refFile.parentNode.insertBefore(n, refFile);
                if (cb) {
                    cb(url, context);
                }
                return;
            }

            n.onload = n.onreadystatechange = function() {
                if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                    
                    data.loaded[this.getAttribute('src')] = true;

                    if (cb) {
                        cb(this.getAttribute('src'), context);
                    }

                    n.onload = n.onreadystatechange = null;
                }
            };

            refFile.parentNode.insertBefore(n, refFile);
        };
        
        fn.calculate = function(e) {
            
            if (!e || !util.isArray(e)) {
                return;
            }


            var i = 0,
                item,
                result = [],
                mods = data.config.mods,
                depeList = [],
                hasAdded = {},
                getDepeList = function(e) {
                    var i = 0, m, reqs;
                    
                    if (hasAdded[e]) {
                        return depeList;
                    }                    
                    hasAdded[e] = true;

                    if (mods[e].requires) {

                        reqs = mods[e].requires;                        
                        for (; typeof (m = reqs[i++]) !== 'undefined';) {
                            if (mods[m]) {
                                getDepeList(m);
                                depeList.push(m);
                            } else {
                                depeList.push(m);
                            }
                        }
                        return depeList;
                    }
                    return depeList;
                };


            for (; typeof (item = e[i++]) !== 'undefined'; ) {   

                if (mods[item] && mods[item].requires && mods[item].requires[0]) {

                    depeList = [];
                    hasAdded = {};
                    
                    result = result.concat(getDepeList(item));
                }
                result.push(item);
            }            
            return result;
        };
        
        fn.onDOMContentLoaded = function() {
            if (_doc.addEventListener) {
                _doc.removeEventListener('DOMContentLoaded', fn.onDOMContentLoaded, false);
                fn.fire();
            } else if (_doc.attachEvent && _doc.readyState === 'complete') {
                _doc.detachEvent('onreadystatechange', fn.onDOMContentLoaded);
                fn.fire();
            }
        };
        
        fn.doScrollCheck = function() {
            if (data.isReady) {
                return;
            }

            try {
                _doc.documentElement.doScroll('left');
            } catch (err) {
                return _win.setTimeout(fn.doScrollCheck, 1);
            }

            fn.fire();
        };
    
        fn.bindReady = function() {
            if (_doc.readyState === 'complete') {
                return _win.setTimeout(fn.fire, 1);
            }

            var toplevel = false;

            if (_doc.addEventListener) {
                _doc.addEventListener('DOMContentLoaded', fn.onDOMContentLoaded, false);
                _win.addEventListener('load', fn.fire, false);
            } else if (_doc.attachEvent) {
                _doc.attachEvent('onreadystatechange', fn.onDOMContentLoaded);
                _win.attachEvent('onload', fn.fire);

                try {
                    toplevel = (_win.frameElement === null);
                } catch (err) {}

                if (document.documentElement.doScroll && toplevel) {
                    fn.doScrollCheck();
                }
            }
        };
    
        fn.use = function() {
            var args = [].slice.call(arguments), thread;

            util.compile(args);

            if (data.globalList.length > 0) {
                args = data.globalList.concat(args);
            }

            if (data.config.autoLoad) {
                args = data.config.coreLib.concat(args);
            }
            
            if (data.isReady) { 
                thread = new _Queue(fn.calculate(args));                
                thread.start();
            } else {
                data.readyList = data.readyList.concat(args);
            }
        };
        
        fn.add = function(sName, oConfig) {
            if (!sName || !oConfig || !oConfig.path) {
                return;
            }            
            data.config.mods[sName] = oConfig;
        };
        
        fn.delay = function() {
            var args = [].slice.call(arguments),
                delay = args.shift();
            
            _win.setTimeout(function() {
                fn.use.apply(this, args);
            }, delay);
        };
        
        fn.ready = function() {
            var args = [].slice.call(arguments);
            
            if (data.isReady) {
                return fn.use.apply(this, args);
            }
            data.readyList = data.readyList.concat(args);
        };
        function jquery_version()
        {
            var v = $.fn.jquery.split('.').join('');
            return parseInt(v) > 1091;
        }

        //  only $ and $.version >= 1.9.1
        
        if(window.$ && jquery_version())
        {            
            
            $ = window.$;  
            if(!$.migrateMute){                                
                util.addCore(data.base + '/jquery-migrate.js');
            }
        }
        else{   
                        
            util.addCore(data.base + '/jquery.js');
            util.addCore(data.base + '/jquery-migrate.js');
        }
        
        
        fn.bindReady();

        
    }(AM._data, AM._util, AM._fn);
    
    var exports = {};
    
    exports.name = 'AM.js';
    exports.version = '2.2';
    
    exports.fn = AM._fn;
    exports.data = AM._data;
    exports.util = AM._util;
    
    return exports;

})());


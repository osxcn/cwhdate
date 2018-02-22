/**
 * @name : cwhDate 假日调休控件
 * @author : 偶是小菜鸟
 * @Site : http://www.osxcn.com.cn/
 */

;!function($, window, document,undefined) {
    "use strict";

    var ready = {
        getPath: function () {
            var jsPath = document.currentScript ? document.currentScript.src : function(){
                var js = document.scripts
                    ,last = js.length - 1
                    ,src;
                for(var i = last; i > 0; i--){
                    if(js[i].readyState === 'interactive'){
                        src = js[i].src;
                        break;
                    }
                }
                return src || js[last].src;
            }();
            return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
        }(),

        // 获取节点的style属性值
        getStyle: function (node, name) {
            var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
            return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
        },

        // 载入CSS配件
        link: function (href, fn, cssname) {

            //未设置路径，则不主动加载css
            if(!cwhdate.path) return;

            var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
            if(typeof fn === 'string') cssname = fn;
            var app = (cssname || href).replace(/\.|\//g, '');
            var id = 'cwhdatecss-'+ app, timeout = 0;

            link.rel = 'stylesheet';
            link.href = cwhdate.path + href;
            link.id = id;

            if(!document.getElementById(id)){
                head.appendChild(link);
            }

            if(typeof fn !== 'function') return;

            //轮询css是否加载完毕
            (function poll() {
                if(++timeout > 8 * 1000 / 100){
                    return window.console && console.error('cwhdate.css: Invalid');
                }
                parseInt(ready.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
            }());
        }
    },

    cwhdate = {
        v: '0.0.1',
        config: {},
        index: (window.cwhdate && window.cwhdate.v) ? 100000 : 0,
        path: ready.getPath,

        // 设置全局项
        set: function(options){
            var that = this;
            that.config = cwh.extend({}, that.config, options);
            return that;
        },

        // 主体CSS等待事件
        ready: function (fn) {
            var cssName = 'cwhdate', ver = '',
                path = 'theme/default/cwhdate.css?v=' + cwhdate.v + ver;
            ready.link(path, fn, cssName);
            return this;
        }
    },

    thisDate = function () {
        var that = this;
        return {
            // 提示框
            hint: function (content) {
                that.hint.call(that. content);
            },
            config: that.config
        };
    },

    // 字符常量
    MOD_NAME = 'cwhdate', ELEM = '.cwhdate', THIS = 'cwhdate-this',
    SHOW = 'cwhdate-show', HIDE = 'cwhdate-hide', DISABLED = 'cwhdate-disabled',
    TIPS_OUT = '开始日期超出了结束日期<br>建议重新选择', LIMIT_YEAR = [100, 200000],
    ELEM_STATIC = 'cwhdate-static', ELEM_LIST = 'cwhdate-list',
    ELEM_SELECTED = 'cwhdate-selected', ELEM_HINT = 'cwhdate-hint', ELEM_PREV = 'cwhdate-day-prev',
    ELEM_NEXT = 'cwhdate-day-next', ELEM_FOOTER = 'cwhdate-footer', ELEM_CONFIRM = '.cwhdate-btns-confirm',
    ELEM_TIME_TEXT = 'cwhdate-time-text', ELEM_TIME_BTN = '.cwhdate-btns-time',

    // 组件构造器
    Class = function (options) {
        var that = this;
        that.index = ++cwhdate.index;
        that.config = cwh.extend({}, that.config, cwhdate.config, options);
        cwhdate.ready(function () {
            that.init();
        });
    },

    // DOM查找
    cwh = function (selector) {
        return new CWH(selector);
    },

    // COM构造器
    CWH = function (selector) {
        var nativeDOM = typeof selector === 'object' ? [selector] : (
                this.selector = selector,
                document.querySelectorAll(selector || null)
            );
        for (var index = 0; index < nativeDOM.length; index++) {
            this.push(nativeDOM[index]);
        }
    };

    /**
     * cwh对象操作
     */
    CWH.prototype = [];
    CWH.prototype.constructor = CWH;

    // 普通对象深度扩展
    cwh.extend = function () {
        var args = arguments,
            clone = function (target, obj) {
                target = target || (obj.constructor === Array ? [] : {});
                for (var i in obj) {
                    // 如果值为对象，则进入递归，继续深度合并
                    target[i] = (obj[i] && (obj[i].constructor === Object))
                        ? clone(target[i], obj[i]) : obj[i];
                }
                return target;
            };
        args[0] = typeof args[0] === 'object' ? args[0] : {};

        for (var ai = 1; ai < args.length; ai++) {
            if (typeof args[ai] === 'object') {
                clone(args[0], args[ai]);
            }
        }
        return args[0];
    };

    // ie版本
    cwh.ie = function () {
        var agent = navigator.userAgent.toLowerCase();
        return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
            (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
        ) : false;
    }();

    // 中止冒泡
    cwh.stope = function(e){
        e = e || window.event;
        e.stopPropagation
            ? e.stopPropagation()
            : e.cancelBubble = true;
    };

    // 对象遍历
    cwh.each = function (obj, fn) {
        var that = this;
        if (typeof fn !== 'function') return that;

        obj = obj || [];
        if (obj.constructor === Object) {
            for (var key in obj) {
                if (fn.call(obj[key], key, obj[key]))
                    break;
            }
        } else {
            for (var key = 0; key < obj.length; key++) {
                if (fn.call(obj[key], key, obj[key]))
                    break;
            }
        }
        return that;
    };

    // 数字前置补零
    cwh.digit = function (num, length) {
        var str = '';
        num = String(num);
        length = length || 2;
        for(var i = num.length; i < length; i++){
            str += '0';
        }
        return num < Math.pow(10, length) ? str + (num|0) : num;
    };

    // 创建元素
    cwh.elem = function (elemName, attr) {
        var elem = document.createElement(elemName);
        cwh.each(attr || {}, function (key, value) {
            elem.setAttribute(key, value);
        });
        return elem;
    };

    // 追加字符
    CWH.addStr = function (str, new_str) {
        str = str.replace(/\s+/, ' ');
        new_str = new_str.replace(/\s+/, ' ').split(' ');
        cwh.each(new_str, function (ii, item) {
            if (!new RegExp('\\b' + item + '\\b').test(str)) {
                str = str + ' ' + item;
            }
        });
        return str.replace(/^\s|\s$/, '');
    };

    // 移除值
    CWH.removeStr = function (str, new_str) {
        str = str.replace(/\s+/, ' ');
        new_str = new_str.replace(/\s+/, ' ').split(' ');
        cwh.each(new_str, function (ii, item) {
            var exp = new RegExp('\\b' + item + '\\b');
            if (exp.test(str)) {
                str = str.replace(exp, '');
            }
        });
        return str.replace(/\s+/, ' ').replace(/^\s|\s$/, '');
    };

    // 查找子元素
    CWH.prototype.find = function (selector) {
        var that = this;
        var arr = [],
            isObject = typeof selector === 'object';

        this.each(function (i, item) {
            var nativeDOM = isObject ? [selector] : item.querySelectorAll(selector || null);
            for (var index = 0; index < nativeDOM.length; i++) {
                arr.push(nativeDOM[index]);
            }
            that.shift();
        });

        if (!isObject) {
            that.selector = (that.selector ?  that.selector + ' ' : '') + selector;
        }

        cwh.each(arr, function (i, item) {
            that.push(item);
        });

        return that;
    };

    // DOM遍历
    CWH.prototype.each = function (fn) {
        return cwh.each.call(this, this, fn);
    };

    // 添加CSS类
    CWH.prototype.addClass = function (className, type) {
        return this.each(function (index, item) {
            item.className = CWH[type ? 'removeStr' : 'addStr'](item.className, className);
        });
    };

    // 移除CSS类
    CWH.prototype.removeClass = function (className) {
        return this.addClass(className, true);
    };

    // 是否包含CSS类
    CWH.prototype.hasClass = function (className) {
        var has = false;
        this.each(function (index, item) {
            if (new RegExp('\\b' + className + '\\b').test(item.className)) {
                has = true;
            }
        });
        return has;
    };

    // 添加或获取属性
    CWH.prototype.attr = function (key, value) {
        var that = this;
        return value === undefined ? function () {
            if (that.length > 0) return that[0].getAttribute(key);
        }() : that.each(function (index, item) {
            item.setAttribute(key, value);
        });
    };

    // 移除属性
    CWH.prototype.removeAttr = function (key) {
        return this.each(function (index, item) {
            item.removeAttribute(key);
        });
    };

    // 设置HTML内容
    CWH.prototype.html = function (html) {
        return this.each(function (index, item) {
            item.innerHTML = html;
        });
    };

    // 设置值
    CWH.prototype.val = function (value) {
        return this.each(function (index, item) {
            item.value = value;
        });
    };

    // 追加内容
    CWH.prototype.append = function (elem) {
        return this.each(function (index, item) {
            typeof elem === 'object'
                ? item.appendChild(elem)
                : item.innerHTML = item.innerHTML + elem;
        });
    };

    // 移除内容
    CWH.prototype.remove = function (elem) {
        return this.each(function (index, item) {
            elem ? item.removeChild(elem) : item.parentNode.removeChild(item);
        });
    };

    // 事件绑定
    CWH.prototype.on = function (eventName, fn) {
        return this.each(function (index, item) {
            item.attachEvent ? item.attachEvent('on' + eventName, function (e) {
                e.target = e.srcElement;
                fn.call(item, e);
            }) : item.addEventListener(eventName, fn, false);
        });
    };

    // 解除事件
    CWH.prototype.off = function (eventName, fn) {
        return this.each(function (index, item) {
            item.detachEvent
                ? item.detachEvent('on' + eventName, fn)
                : item.removeEventListener(eventName, fn, false);
        });
    };

    /**
     * 组件操作
     */

    // 是否闰年
    Class.isLeapYear = function (year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    // 默认配置
    Class.prototype.config = {
        type: 'date',   // 控件类型， 支持：year/month/date。注：此配置不可更改
        format: 'yyyy-MM-dd',   // 默认日期格式
        value: null,           // 默认日期，支持传入new Date()，或者符合format参数设定的日期格式字符
        min: '1900-1-1',         // 最小有效日期,年月日必须用“-”分割。注意：它并不是遵循 format 设定的格式。
        max: '2099-12-31',       // 最大有效日期，同上
        trigger: 'focus',        // 呼出控件的事件
        showToolbar: true,      // 是否显示工具栏
        btns: ['clear', 'now'],  // 工具栏显示的按钮，会按数组顺序排序
        lang: 'cn',              // 语言，只支持中文
        theme: 'default',       // 主题
        position: 'static',      // 定位方式，仅支持静态显示
        done: null,             // 控件选择完毕后的回调，点击清空/现在也会触发
        change: null            // 日期时间改变后的回调
    };

    // 多语言
    Class.prototype.lang = function () {
        var that = this,
            options = that.config,
            text = {
                cn: {
                    weeks: ['日', '一', '二', '三', '四', '五', '六'],
                    timeTips: '选择时间',
                    startTime: '开始时间',
                    endTime: '结束时间',
                    dateTips: '返回日期',
                    month: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
                    tools: {
                        clear: '清空',
                        now: '现在'
                    }
                },
                en: {
                    weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    timeTips: 'Select Time',
                    startTime: 'Start Time',
                    endTime: 'End Time',
                    dateTips: 'Select Date',
                    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    tools: {
                        clear: 'Clear',
                        now: 'Now'
                    }
                }
            };
        return text[options.lang] || text['cn'];
    };

    // 初始准备
    Class.prototype.init = function () {
        var that = this,
            options = that.config,
            dateType = 'yyyy|y|MM|M|dd|d',
            format = {
                year: 'yyyy',
                month: 'yyyy-MM',
                date: 'yyyy-MM-dd'
            };

        options.elem = cwh(options.elem);
        options.eventElem = cwh(options.eventElem);

        if (!options.elem[0])
            return ;

        // 根据不同type，初始化默认format
        if (options.format === format.date) {
            options.format = format[options.type];
        }

        // 将日期格式转化成数组
        that.format = options.format.match(new RegExp(dateType + '|.', 'g')) || [];

        // 生成正则表达式
        that.EXP_IF = '';
        that.EXP_SPLIT = '';
        cwh.each(that.format, function (i, item) {
            var EXP = new RegExp(dateType).test(item)
                ? '\\d{' + function () {
                    if (new RegExp(dateType).test(that.format[i === 0 ? i + 1 : i - 1] || '')) {
                        if (/^yyyy|y$/.test(item))
                            return 4;
                        return item.length;
                    }
                    if (/^yyyy$/.test(item))
                        return '1,4';
                    if (/^y$/.test(item))
                        return '1,308';
                    return '1,2';
                }() + '}'
                : '\\' + item;
            that.EXP_IF = that.EXP_IF + EXP;
            that.EXP_SPLIT = that.EXP_SPLIT + '(' + EXP + ')';
        });
        that.EXP_IF = new RegExp('^' + that.EXP_IF + '$');
        that.EXP_SPLIT = new RegExp('^' + that.EXP_SPLIT + '$', '');

        // 如果不是input|textarea元素，则默认采用click事件
        if (!that.isInput(options.elem[0])) {
            if (options.trigger === 'focus') {
                options.trigger = 'click';
            }
        }

        // 设置唯一KEY
        if (!options.elem.attr('cwh-key')) {
            options.elem.attr('cwh-key', that.index);
            options.eventElem.attr('cwh-key', that.index);
        }

        // 获取限制内日期
        cwh.each(['min', 'max'], function (i, item) {
            var ymd = [];
            if (typeof options[item] === 'number') {    // 如果为数字
                var day = options[item],
                    time = new Date().getTime(),
                    STAMP = 86400000,   // 代表一天的时间戳
                    thisDate = new Date(
                        day ? (
                            day < STAMP ? time + day * STAMP : day //如果数字小于一天的时间戳，则数字为天数，否则为时间戳
                        ) : time
                    );
                ymd = [thisDate.getFullYear(), thisDate.getMonth() + 1, thisDate.getDate()];
            } else {
                ymd = (options[item].match(/\d+-\d+-\d+/) || [''][0].split('-'));
            }

            options[item] = {
                year: ymd[0] | 0 || new Date().getFullYear(),
                month: ymd[1] ? (ymd[1] | 0) : new Date().getMonth(),
                date: ymd[2] | 0 || new Date().getDate()
            };
        });

        that.elemID = 'cwhdate' + options.elem.attr('cwh-key');

        that.render();
        that.events();

        // 默认赋值
        if (options.value) {
            if (options.value.constructor === Date) {
                that.setValue(that.parse(0, that.systemDate(options.value)));
            } else {
                that.setValue(options.value);
            }
        }
    };

    // 控件主体渲染
    Class.prototype.render = function () {
        var that = this,
            options = that.config,
            lang = that.lang(),

            // 主面板
            elem = that.elem = cwh.elem('div', {
                id: that.elemID,
                'class': [
                    'cwhdate',
                    options.theme && options.theme !== 'default' && !/^#/.test(options.theme) ? 'cwhdate-theme-' + options.theme : ''
                ].join('')
            }),

            // 主区域
            elemMain = that.elemMain = []


        // 插入到指定容器中
        options.elem.append(elem);

        // that.checkDate().calendar();    // 初始校验
        that.changeEvent();             // 日期切换

        Class.thisElemDate = that.elemID;

        typeof options.ready === 'function' && options.ready(cwh.extend({}, options, dateTime, {
            month: options.dateTime.month + 1
        }));
    };

    // 提示
    Class.prototype.hint = function (content) {
        var that = this,
            div = cwh.elem('div', {
                'class': ELEM_HINT
            });

        div.innerHTML = content || '';
        cwh(that.elem).find('.' + ELEM_HINT).remove();
        that.elem.appendChild(div);

        clearTimeout(that.hinTimer);
        that.hinTimer = setTimeout(function () {
            cwh(that.elem).find('.' + ELEM_HINT).remove();
        }, 3000);
    };

    // 获取递增/减后的年月


    // 系统消息
    Class.prototype.systemDate = function (newDate) {
        var thisDate = newDate || new Date();
        return {
            year: thisDate.getFullYear(),   // 年
            month: thisDate.getMonth(),     // 月
            date: thisDate.getDate()        // 日
        };
    };

    // 日期校验
    Class.prototype.checkDate = function(fn) {
        var that = this,
            thisDate = new Date(),
            options = that.config,
            dateTime = options.dateTime = options.dateTime || that.systemDate(),
            error,
            elem = that.bindElem || options.elem[0],
            value = that.isInput(elem) ? elem.value : '',

            // 校验日期有效数字
            checkValid = function (dateTime) {
                if (dateTime.year > LIMIT_YEAR[1]) {
                    dateTime.year = LIMIT_YEAR[1];
                    error = true;
                }
                if (dateTime.month > 11) {
                    dateTime.month = 11;
                    error = true;
                }

                // 计算当前月的最后一天
                var thisMaxDate = cwhdate.getEndDate(dateTime.month + 1, dateTime.year);
                if (dateTime.date > thisMaxDate) {
                    dateTime.date = thisMaxDate;
                    error = true;
                }
            },

            // 获得初始化日期值
            initDate = function (dateTime, value, index) {
                var startEnd = ['startTime', 'endTime'];
                value = (value.match(that.EXP_SPLIT) || []).slice(1);
                index = index || 0;

                cwh.each(that.format, function (i, item) {
                    var thisv = parseFloat(value[i]);
                    if (/yyyy|y/.test(item)) {  // 年
                        if (thisv < LIMIT_YEAR[0]) {
                            thisv = LIMIT_YEAR[0];
                            error = true;
                        }
                    } else if (/MM|M/.test(item)) { // 月
                        if (thisv < 1) {
                            thisv = 1;
                            error = true;
                        }
                        dateTime.month = thisv - 1;
                    } else if (/dd|d/.test(item)) { // 日
                        if (thisv < 1) {
                            thisv = 1;
                            error = true;
                        }
                        dateTime.date = thisv;
                    }
                });
                checkValid(dateTime);
            };

        if (fn === 'limit')
            return checkValid(dateTime), that;

        value = value || options.value;
        if (typeof value === 'string') {
            value = value.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
        }

        // 如果点击了开始，单未选择结束就关闭，则重新选择开始
        if (that.startState && !that.endState) {
            delete that.startState;
            that.endState = true;
        }

        if (typeof value === 'string' && value) {
            if (that.EXP_IF.test(value)) {  // 校验日期格式
                initDate(dateTime, value);
            } else {
                that.hint('日期格式不合法<br>必须遵循下述格式：<br>' + options.format + '<br>已为你重置');
                error = true;
            }
        } else if (value && value.constructor === Date) {   // 如果值为日期对象时
            options.dateTime = that.systemDate(value);
        } else {
            options.dateTime = that.systemDate();
            delete that.startState;
            delete that.endState;
            delete that.startDate;
            delete that.endDate;
        }

        checkValid(dateTime);

        if (error && value) {
            that.setValue(that.parse());
        }
        fn && fn();

        return this;
    };

    // 无效日期范围内的标记


    // 日历表


    // 生成年月列表


    // 记录列表切换后的年月


    // 关闭列表


    // 检测结束日期是否超出开始日期


    // 转义为规定格式的日期字符


    // 创建指定日期时间对象


    // 赋值
    Class.prototype.setValue = function (value) {
        var that = this,
            options = that.config,
            elem = that.bindElem || options.elem[0],
            valType = that.isInput(elem) ? 'val' : 'html';

        cwh(elem)[valType](value || '');
        return this;
    };

    // 标记范围内的日期


    // 执行done/change回调


    // 选择日期


    // 底部按钮


    // 统一处理切换


    // 日期切换事件
    Class.prototype.changeEvent = function() {

    };

    // 是否输入框
    Class.prototype.isInput = function (elem) {
        return /input | textarea/.test(elem.tagName.toLocaleLowerCase());
    };


    // 绑定元素事件处理
    Class.prototype.events = function () {

    };


    // 核心接口
    cwhdate.render = function (options) {
        var inst = new Class(options);
        return thisDate.call(inst);
    };

    // 得到某月的最后一天
    cwhdate.getEndDate = function (year, month) {
        var thisDate = new Date();
        // 设置日期为下个月的第一天
        thisDate.setFullYear(
            year || thisDate.getFullYear(),
            month || (thisDate.getMonth() + 1),
            1
        );
        // 减去一天，得到当前月最后一天
        return new Date(thisDate.getTime() - 1000*60*60*24).getDate();
    };

    // 暴露cwh
    window.cwh = window.cwh || cwh;

    // 加载方式
    (typeof define === 'function' && define.amd) ? define(function() {  //requirejs加载
        return cwhdate;
    }) : function() {   //普通script标签加载
        cwhdate.ready();
        window.cwhdate = cwhdate;
    }()

}(jQuery, window, document);
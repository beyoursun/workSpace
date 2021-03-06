/* global $:true */
/* jshint unused:false*/
(function($) {
    "use strict";

    $.fn.transitionEnd = function(callback) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i, dom = this;

        function fireCallBack(e) {
            /*jshint validthis:true */
            if (e.target !== this) return;
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };

    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    $.getTouchPosition = function(e) {
        e = e.originalEvent || e; //jquery wrap the originevent
        if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
            return {
                x: e.targetTouches[0].pageX,
                y: e.targetTouches[0].pageY
            };
        } else {
            return {
                x: e.pageX,
                y: e.pageY
            };
        }
    };

    $.fn.scrollHeight = function() {
        return this[0].scrollHeight;
    };

    $.fn.transform = function(transform) {
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
        }
        return this;
    };
    $.fn.transition = function(duration) {
        if (typeof duration !== 'string') {
            duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
    };

    $.getTranslate = function(el, axis) {
        var matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = 'x';
        }

        curStyle = window.getComputedStyle(el, null);
        if (window.WebKitCSSMatrix) {
            // Some old versions of Webkit choke when 'none' is passed; pass
            // empty string instead in this case
            transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
            matrix = transformMatrix.toString().split(',');
        }

        if (axis === 'x') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m41;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[12]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[4]);
        }
        if (axis === 'y') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m42;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[13]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[5]);
        }

        return curTransform || 0;
    };
    $.requestAnimationFrame = function(callback) {
        if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
        else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
        else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
        else {
            return window.setTimeout(callback, 1000 / 60);
        }
    };

    $.cancelAnimationFrame = function(id) {
        if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
        else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
        else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
        else {
            return window.clearTimeout(id);
        }
    };

    $.fn.join = function(arg) {
        return this.toArray().join(arg);
    }
})($);;
(function($) {
    "use strict";
    var device = {};
    var ua = navigator.userAgent;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

    // Android
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

    // Minimal UI
    if (device.os && device.os === 'ios') {
        var osVersionArr = device.osVersion.split('.');
        device.minimalUi = !device.webView &&
            (ipod || iphone) &&
            (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
            $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
    }

    // Check for status bar and fullscreen app mode
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    } else {
        device.statusBar = false;
    }

    // Classes
    var classNames = [];

    // Pixel Ratio
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }

    // OS classes
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var major = parseInt(device.osVersion.split('.')[0], 10);
            for (var i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }

    }
    // Status bar classes
    if (device.statusBar) {
        classNames.push('with-statusbar-overlay');
    } else {
        $('html').removeClass('with-statusbar-overlay');
    }

    // Add html classes
    if (classNames.length > 0) $('html').addClass(classNames.join(' '));

    $.device = device;
})($); + function($) {
    "use strict";

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    var Picker = function(params) {
        var p = this;
        var defaults = {
            updateValuesOnMomentum: false,
            updateValuesOnTouchmove: true,
            rotateEffect: false,
            momentumRatio: 7,
            freeMode: false,
            // Common settings
            scrollToInput: true,
            inputReadOnly: true,
            toolbar: true,
            toolbarCloseText: '完成',
            title: '请选择',
            toolbarTemplate: '<div class="toolbar">\
          <div class="toolbar-inner">\
          <a href="javascript:;" class="picker-button close-picker">{{closeText}}</a>\
          <h1 class="title">{{title}}</h1>\
          </div>\
          </div>',
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }
        p.params = params;
        p.cols = [];
        p.initialized = false;

        // Inline flag
        p.inline = p.params.container ? true : false;

        // 3D Transforms origin bug, only on safari
        var originBug = $.device.ios || (navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0) && !$.device.android;

        // Should be converted to popover
        function isPopover() {
            var toPopover = false;
            if (!p.params.convertToPopover && !p.params.onlyInPopover) return toPopover;
            if (!p.inline && p.params.input) {
                if (p.params.onlyInPopover) toPopover = true;
                else {
                    if ($.device.ios) {
                        toPopover = $.device.ipad ? true : false;
                    } else {
                        if ($(window).width() >= 768) toPopover = true;
                    }
                }
            }
            return toPopover;
        }

        function inPopover() {
            if (p.opened && p.container && p.container.length > 0 && p.container.parents('.popover').length > 0) return true;
            else return false;
        }

        // Value
        p.setValue = function(arrValues, transition) {
            var valueIndex = 0;
            for (var i = 0; i < p.cols.length; i++) {
                if (p.cols[i] && !p.cols[i].divider) {
                    p.cols[i].setValue(arrValues[valueIndex], transition);
                    valueIndex++;
                }
            }
        };
        p.updateValue = function() {
            var newValue = [];
            var newDisplayValue = [];
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    newValue.push(p.cols[i].value);
                    newDisplayValue.push(p.cols[i].displayValue);
                }
            }
            if (newValue.indexOf(undefined) >= 0) {
                return;
            }
            p.value = newValue;
            p.displayValue = newDisplayValue;
            if (p.params.onChange) {
                p.params.onChange(p, p.value, p.displayValue);
            }
            if (p.input && p.input.length > 0) {
                $(p.input).val(p.params.formatValue ? p.params.formatValue(p, p.value, p.displayValue) : p.value.join(' '));
                $(p.input).trigger('change');
            }
        };

        // Columns Handlers
        p.initPickerCol = function(colElement, updateItems) {
            var colContainer = $(colElement);
            var colIndex = colContainer.index();
            var col = p.cols[colIndex];
            if (col.divider) return;
            col.container = colContainer;
            col.wrapper = col.container.find('.picker-items-col-wrapper');
            col.items = col.wrapper.find('.picker-item');

            var i, j;
            var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
            col.replaceValues = function(values, displayValues) {
                col.destroyEvents();
                col.values = values;
                col.displayValues = displayValues;
                var newItemsHTML = p.columnHTML(col, true);
                col.wrapper.html(newItemsHTML);
                col.items = col.wrapper.find('.picker-item');
                col.calcSize();
                col.setValue(col.values[0], 0, true);
                col.initEvents();
            };
            col.calcSize = function() {
                if (p.params.rotateEffect) {
                    col.container.removeClass('picker-items-col-absolute');
                    if (!col.width) col.container.css({
                        width: ''
                    });
                }
                var colWidth, colHeight;
                colWidth = 0;
                colHeight = col.container[0].offsetHeight;
                wrapperHeight = col.wrapper[0].offsetHeight;
                itemHeight = col.items[0].offsetHeight;
                itemsHeight = itemHeight * col.items.length;
                minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                maxTranslate = colHeight / 2 - itemHeight / 2;
                if (col.width) {
                    colWidth = col.width;
                    if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
                    col.container.css({
                        width: colWidth
                    });
                }
                if (p.params.rotateEffect) {
                    if (!col.width) {
                        col.items.each(function() {
                            var item = $(this);
                            item.css({
                                width: 'auto'
                            });
                            colWidth = Math.max(colWidth, item[0].offsetWidth);
                            item.css({
                                width: ''
                            });
                        });
                        col.container.css({
                            width: (colWidth + 2) + 'px'
                        });
                    }
                    col.container.addClass('picker-items-col-absolute');
                }
            };
            col.calcSize();

            col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);


            var activeIndex = 0;
            var animationFrameId;

            // Set Value Function
            col.setValue = function(newValue, transition, valueCallbacks) {
                if (typeof transition === 'undefined') transition = '';
                var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
                if (typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                    return;
                }
                var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
                // Update wrapper
                col.wrapper.transition(transition);
                col.wrapper.transform('translate3d(0,' + (newTranslate) + 'px,0)');

                // Watch items
                if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex) {
                    $.cancelAnimationFrame(animationFrameId);
                    col.wrapper.transitionEnd(function() {
                        $.cancelAnimationFrame(animationFrameId);
                    });
                    updateDuringScroll();
                }

                // Update items
                col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
            };

            col.updateItems = function(activeIndex, translate, transition, valueCallbacks) {
                if (typeof translate === 'undefined') {
                    translate = $.getTranslate(col.wrapper[0], 'y');
                }
                if (typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate) / itemHeight);
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
                var previousActiveIndex = col.activeIndex;
                col.activeIndex = activeIndex;
                /*
                col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');

                col.items.transition(transition);
                var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
                var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                var nextItems = selectedItem.nextAll().addClass('picker-after-selected');
                */
                //去掉 .picker-after-selected, .picker-before-selected 以提高性能
                col.wrapper.find('.picker-selected').removeClass('picker-selected');
                if (p.params.rotateEffect) {
                    col.items.transition(transition);
                }
                var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');

                if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                    // Update values
                    col.value = selectedItem.attr('data-picker-value');
                    col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                    // On change callback
                    if (previousActiveIndex !== activeIndex) {
                        if (col.onChange) {
                            col.onChange(p, col.value, col.displayValue);
                        }
                        p.updateValue();
                    }
                }

                // Set 3D rotate effect
                if (!p.params.rotateEffect) {
                    return;
                }
                var percentage = (translate - (Math.floor((translate - maxTranslate) / itemHeight) * itemHeight + maxTranslate)) / itemHeight;

                col.items.each(function() {
                    var item = $(this);
                    var itemOffsetTop = item.index() * itemHeight;
                    var translateOffset = maxTranslate - translate;
                    var itemOffset = itemOffsetTop - translateOffset;
                    var percentage = itemOffset / itemHeight;

                    var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

                    var angle = (-18 * percentage);
                    if (angle > 180) angle = 180;
                    if (angle < -180) angle = -180;
                    // Far class
                    if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                    else item.removeClass('picker-item-far');
                    // Set transform
                    item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                });
            };

            function updateDuringScroll() {
                animationFrameId = $.requestAnimationFrame(function() {
                    col.updateItems(undefined, undefined, 0);
                    updateDuringScroll();
                });
            }

            // Update items on init
            if (updateItems) col.updateItems(0, maxTranslate, 0);

            var allowItemClick = true;
            var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;

            function handleTouchStart(e) {
                if (isMoved || isTouched) return;
                e.preventDefault();
                isTouched = true;
                var position = $.getTouchPosition(e);
                touchStartY = touchCurrentY = position.y;
                touchStartTime = (new Date()).getTime();

                allowItemClick = true;
                startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
            }

            function handleTouchMove(e) {
                if (!isTouched) return;
                e.preventDefault();
                allowItemClick = false;
                var position = $.getTouchPosition(e);
                touchCurrentY = position.y;
                if (!isMoved) {
                    // First move
                    $.cancelAnimationFrame(animationFrameId);
                    isMoved = true;
                    startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                    col.wrapper.transition(0);
                }
                e.preventDefault();

                var diff = touchCurrentY - touchStartY;
                currentTranslate = startTranslate + diff;
                returnTo = undefined;

                // Normalize translate
                if (currentTranslate < minTranslate) {
                    currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                    returnTo = 'min';
                }
                if (currentTranslate > maxTranslate) {
                    currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                    returnTo = 'max';
                }
                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

                // Update items
                col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);

                // Calc velocity
                velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                velocityTime = (new Date()).getTime();
                prevTranslate = currentTranslate;
            }

            function handleTouchEnd(e) {
                if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
                isTouched = isMoved = false;
                col.wrapper.transition('');
                if (returnTo) {
                    if (returnTo === 'min') {
                        col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
                    } else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
                }
                touchEndTime = new Date().getTime();
                var velocity, newTranslate;
                if (touchEndTime - touchStartTime > 300) {
                    newTranslate = currentTranslate;
                } else {
                    velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                    newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
                }

                newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

                // Active Index
                var activeIndex = -Math.floor((newTranslate - maxTranslate) / itemHeight);

                // Normalize translate
                if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + (parseInt(newTranslate, 10)) + 'px,0)');

                // Update items
                col.updateItems(activeIndex, newTranslate, '', true);

                // Watch items
                if (p.params.updateValuesOnMomentum) {
                    updateDuringScroll();
                    col.wrapper.transitionEnd(function() {
                        $.cancelAnimationFrame(animationFrameId);
                    });
                }

                // Allow click
                setTimeout(function() {
                    allowItemClick = true;
                }, 100);
            }

            function handleClick(e) {
                if (!allowItemClick) return;
                $.cancelAnimationFrame(animationFrameId);
                /*jshint validthis:true */
                var value = $(this).attr('data-picker-value');
                col.setValue(value);
            }

            col.initEvents = function(detach) {
                var method = detach ? 'off' : 'on';
                col.container[method]($.touchEvents.start, handleTouchStart);
                col.container[method]($.touchEvents.move, handleTouchMove);
                col.container[method]($.touchEvents.end, handleTouchEnd);
                col.items[method]('click', handleClick);
            };
            col.destroyEvents = function() {
                col.initEvents(true);
            };

            col.container[0].f7DestroyPickerCol = function() {
                col.destroyEvents();
            };

            col.initEvents();

        };
        p.destroyPickerCol = function(colContainer) {
            colContainer = $(colContainer);
            if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
        };
        // Resize cols
        function resizeCols() {
            if (!p.opened) return;
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    p.cols[i].calcSize();
                    p.cols[i].setValue(p.cols[i].value, 0, false);
                }
            }
        }
        $(window).on('resize', resizeCols);

        // HTML Layout
        p.columnHTML = function(col, onlyItems) {
            var columnItemsHTML = '';
            var columnHTML = '';
            if (col.divider) {
                columnHTML += '<div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
            } else {
                for (var j = 0; j < col.values.length; j++) {
                    columnItemsHTML += '<div class="picker-item" data-picker-value="' + col.values[j] + '">' + (col.displayValues ? col.displayValues[j] : col.values[j]) + '</div>';
                }
                columnHTML += '<div class="picker-items-col ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '"><div class="picker-items-col-wrapper">' + columnItemsHTML + '</div></div>';
            }
            return onlyItems ? columnItemsHTML : columnHTML;
        };
        p.layout = function() {
            var pickerHTML = '';
            var pickerClass = '';
            var i;
            p.cols = [];
            var colsHTML = '';
            for (i = 0; i < p.params.cols.length; i++) {
                var col = p.params.cols[i];
                colsHTML += p.columnHTML(p.params.cols[i]);
                p.cols.push(col);
            }
            pickerClass = 'weui-picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '') + (p.params.cols.length === 1 ? ' picker-columns-single' : '');
            pickerHTML =
                '<div class="' + (pickerClass) + '">' +
                (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText).replace(/{{title}}/g, p.params.title) : '') +
                '<div class="picker-modal-inner picker-items">' +
                colsHTML +
                '<div class="picker-center-highlight"></div>' +
                '</div>' +
                '</div>';

            p.pickerHTML = pickerHTML;
        };

        // Input Events
        function openOnInput(e) {
            e.preventDefault();
            if (p.opened) return;
            p.open();
            if (p.params.scrollToInput && !isPopover()) {
                var pageContent = p.input.parents('.content');
                if (pageContent.length === 0) return;

                var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                    paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                    pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                    pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                    newPaddingBottom;
                var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                if (inputTop > pageHeight) {
                    var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                    if (scrollTop + pageHeight > pageScrollHeight) {
                        newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                        if (pageHeight === pageScrollHeight) {
                            newPaddingBottom = p.container.height();
                        }
                        pageContent.css({
                            'padding-bottom': (newPaddingBottom) + 'px'
                        });
                    }
                    pageContent.scrollTop(scrollTop, 300);
                }
            }
        }

        function closeOnHTMLClick(e) {
            if (inPopover()) return;
            if (p.input && p.input.length > 0) {
                if (e.target !== p.input[0] && $(e.target).parents('.weui-picker-modal').length === 0) p.close();
            } else {
                if ($(e.target).parents('.weui-picker-modal').length === 0) p.close();
            }
        }

        if (p.params.input) {
            p.input = $(p.params.input);
            if (p.input.length > 0) {
                if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                if (!p.inline) {
                    p.input.on('click', openOnInput);
                }
                if (p.params.inputReadOnly) {
                    p.input.on('focus mousedown', function(e) {
                        e.preventDefault();
                    });
                }
            }

        }

        // if (!p.inline) $('html').on('click', closeOnHTMLClick);//sunjianguo modify

        // Open
        function onPickerClose() {
            p.opened = false;
            if (p.input && p.input.length > 0) p.input.parents('.page-content').css({
                'padding-bottom': ''
            });
            if (p.params.onClose) p.params.onClose(p);

            // Destroy events
            p.container.find('.picker-items-col').each(function() {
                p.destroyPickerCol(this);
            });
        }

        p.opened = false;
        p.open = function() {
            var toPopover = isPopover();

            if (!p.opened) {

                // Layout
                p.layout();

                // Append
                if (toPopover) {
                    p.pickerHTML = '<div class="popover popover-picker-columns"><div class="popover-inner">' + p.pickerHTML + '</div></div>';
                    p.popover = $.popover(p.pickerHTML, p.params.input, true);
                    p.container = $(p.popover).find('.weui-picker-modal');
                    $(p.popover).on('close', function() {
                        onPickerClose();
                    });
                } else if (p.inline) {
                    p.container = $(p.pickerHTML);
                    p.container.addClass('picker-modal-inline');
                    $(p.params.container).append(p.container);
                } else {
                    p.container = $($.openPicker(p.pickerHTML));
                    $(p.container)
                        .on('close', function() {
                            onPickerClose();
                        });
                }

                // Store picker instance
                p.container[0].f7Picker = p;

                // Init Events
                p.container.find('.picker-items-col').each(function() {
                    var updateItems = true;
                    if ((!p.initialized && p.params.value) || (p.initialized && p.value)) updateItems = false;
                    p.initPickerCol(this, updateItems);
                });

                // Set value
                if (!p.initialized) {
                    if (p.params.value) {
                        p.setValue(p.params.value, 0);
                    }
                } else {
                    if (p.value) p.setValue(p.value, 0);
                }
            }

            // Set flag
            p.opened = true;
            p.initialized = true;

            if (p.params.onOpen) p.params.onOpen(p);
        };

        // Close
        p.close = function(force) {
            if (!p.opened || p.inline) return;
            if (inPopover()) {
                $.closePicker(p.popover);
                return;
            } else {
                $.closePicker(p.container);
                return;
            }
        };

        // Destroy
        p.destroy = function() {
            p.close();
            if (p.params.input && p.input.length > 0) {
                p.input.off('click focus', openOnInput);
            }
            $('html').off('click', closeOnHTMLClick);
            $(window).off('resize', resizeCols);
        };

        if (p.inline) {
            p.open();
        }

        return p;
    };

    $(document).on("click", ".close-picker", function() {
        var pickerToClose = $('.weui-picker-modal.weui-picker-modal-visible');
        if (pickerToClose.length > 0) {
            $.closePicker(pickerToClose);
        }
        $('.weui-mask').remove(); //sunjianguo add on 20170321
        $('body').removeClass('weui-mask-overflow');
    });

    //修复picker会滚动页面的bug
    $(document).on($.touchEvents.move, ".picker-modal-inner", function(e) {
        e.preventDefault();
    });


    $.openPicker = function(tpl, className, callback) {

        if (typeof className === "function") {
            callback = className;
            className = undefined;
        }

        $.closePicker();

        var container = $("<div class='weui-picker-container " + (className || "") + "'></div>").appendTo(document.body);
        container.show();

        $("<div class='weui-mask'></div>").appendTo(document.body); //sunjianguo add on 20170321
        $('body').addClass('weui-mask-overflow');
        container.addClass("weui-picker-container-visible");

        //关于布局的问题，如果直接放在body上，则做动画的时候会撑开body高度而导致滚动条变化。
        var dialog = $(tpl).appendTo(container);

        dialog.width(); //通过取一次CSS值，强制浏览器不能把上下两行代码合并执行，因为合并之后会导致无法出现动画。

        dialog.addClass("weui-picker-modal-visible");

        callback && container.on("close", callback);

        return dialog;
    }

    $.updatePicker = function(tpl) {
        var container = $(".weui-picker-container-visible");
        if (!container[0]) return false;

        container.html("");

        var dialog = $(tpl).appendTo(container);

        dialog.addClass("weui-picker-modal-visible");

        return dialog;
    }

    $.closePicker = function(container, callback) {
        if (typeof container === "function") callback = container;
        $(".weui-picker-modal-visible").removeClass("weui-picker-modal-visible").transitionEnd(function() {
            $(this).parent().remove();
            callback && callback();
        }).trigger("close");
    };

    $.fn.picker = function(params) {
        var args = arguments;
        return this.each(function() {
            if (!this) return;
            var $this = $(this);

            var picker = $this.data("picker");
            if (!picker) {
                params = params || {};
                var inputValue = $this.val();
                if (params.value === undefined && inputValue !== "") {
                    params.value = params.cols.length > 1 ? inputValue.split(" ") : [inputValue];
                }
                var p = $.extend({
                    input: this
                }, params);
                picker = new Picker(p);
                $this.data("picker", picker);
            }
            if (typeof params === typeof "a") {
                picker[params].apply(picker, Array.prototype.slice.call(args, 1));
            }
        });
    };
}($); + function($) {
    "use strict";


    var defaults;

    var formatNumber = function(n) {
        return n < 10 ? "0" + n : n;
    }

    var Datetime = function(input, params) {
        this.input = $(input);
        this.params = params;

        this.initMonthes = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ');

        this.initYears = (function() {
            var arr = [];
            for (var i = 1950; i <= 2030; i++) {
                arr.push(i);
            }
            return arr;
        })();

        var p = $.extend({}, params, this.getConfig());
        $(this.input).picker(p);
    }

    Datetime.prototype = {
        getDays: function(max) {
            var days = [];
            for (var i = 1; i <= (max || 31); i++) {
                days.push(i < 10 ? "0" + i : i);
            }
            return days;
        },

        getDaysByMonthAndYear: function(month, year) {
            var int_d = new Date(year, parseInt(month) + 1 - 1, 1);
            var d = new Date(int_d - 1);
            return this.getDays(d.getDate());
        },
        getConfig: function() {
            var today = new Date(),
                params = this.params,
                self = this,
                lastValidValues;

            var config = {
                rotateEffect: false, //为了性能
                cssClass: 'datetime-picker',

                value: [today.getFullYear(), formatNumber(today.getMonth() + 1), formatNumber(today.getDate()), formatNumber(today.getHours()), (formatNumber(today.getMinutes()))],

                onChange: function(picker, values, displayValues) {
                    var cols = picker.cols;
                    var days = self.getDaysByMonthAndYear(values[1], values[0]);
                    var currentValue = values[2];
                    if (currentValue > days.length) currentValue = days.length;
                    picker.cols[4].setValue(currentValue);

                    //check min and max
                    var current = new Date(values[0] + '-' + values[1] + '-' + values[2]);
                    var valid = true;
                    if (params.min) {
                        var min = new Date(typeof params.min === "function" ? params.min() : params.min);

                        if (current < +min) {
                            picker.setValue(lastValidValues);
                            valid = false;
                        }
                    }
                    if (params.max) {
                        var max = new Date(typeof params.max === "function" ? params.max() : params.max);
                        if (current > +max) {
                            picker.setValue(lastValidValues);
                            valid = false;
                        }
                    }

                    valid && (lastValidValues = values);

                    if (self.params.onChange) {
                        self.params.onChange.apply(this, arguments);
                    }
                },

                formatValue: function(p, values, displayValues) {
                    return self.params.format(p, values, displayValues);
                },

                cols: [{
                        values: (function() {
                            var years = [];
                            for (var i = 1950; i <= 2050; i++) years.push(i);
                            return years;
                        })()
                    }, {
                        divider: true, // 这是一个分隔符
                        content: params.yearSplit
                    }, {
                        values: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                    }, {
                        divider: true, // 这是一个分隔符
                        content: params.monthSplit
                    }, {
                        values: (function() {
                            var dates = [];
                            for (var i = 1; i <= 31; i++) dates.push(formatNumber(i));
                            return dates;
                        })()
                    },

                ]
            }

            if (params.dateSplit) {
                config.cols.push({
                    divider: true,
                    content: params.dateSplit
                })
            }

            config.cols.push({
                divider: true,
                content: params.datetimeSplit
            })

            var times = self.params.times();
            if (times && times.length) {
                config.cols = config.cols.concat(times);
            }

            var inputValue = this.input.val();
            if (inputValue) config.value = params.parse(inputValue);
            if (this.params.value) {
                this.input.val(this.params.value);
                config.value = params.parse(this.params.value);
            }

            return config;
        }
    }

    $.fn.datetimePicker = function(params) {
        params = $.extend({}, defaults, params);
        return this.each(function() {
            if (!this) return;
            var $this = $(this);
            var datetime = $this.data("datetime");
            if (!datetime) $this.data("datetime", new Datetime(this, params));
            return datetime;
        });
    };

    defaults = $.fn.datetimePicker.prototype.defaults = {
        input: undefined, // 默认值
        min: undefined, // YYYY-MM-DD 最大最小值只比较年月日，不比较时分秒
        max: undefined, // YYYY-MM-DD
        yearSplit: '-',
        monthSplit: '-',
        dateSplit: '', // 默认为空
        datetimeSplit: ' ', // 日期和时间之间的分隔符，不可为空
        times: function() {
            return [ // 自定义的时间
                {
                    values: (function() {
                        var hours = [];
                        for (var i = 0; i < 24; i++) hours.push(formatNumber(i));
                        return hours;
                    })()
                }, {
                    divider: true, // 这是一个分隔符
                    content: ':'
                }, {
                    values: (function() {
                        var minutes = [];
                        for (var i = 0; i < 59; i++) minutes.push(formatNumber(i));
                        return minutes;
                    })()
                }
            ];
        },
        format: function(p, values) { // 数组转换成字符串
            return p.cols.map(function(col) {
                return col.value || col.content;
            }).join('');
        },
        parse: function(e) {
            // 把字符串转换成数组，用来解析初始值
            // 如果你的定制的初始值格式无法被这个默认函数解析，请自定义这个函数。比如你的时间是 '子时' 那么默认情况这个'时'会被当做分隔符而导致错误，所以你需要自己定义parse函数
            // 默认兼容的分隔符
            var t = e.split(this.datetimeSplit);
            if (t.length === 1) { //suport  only having year month day (sunjiangguo 20170215)
                t[1] = ' ';
            }
            return t[0].split(/\D/).concat(t[1].split(/:|时|分|秒/)).filter(function(e) {
                return !!e
            })
        }
    }

}($);

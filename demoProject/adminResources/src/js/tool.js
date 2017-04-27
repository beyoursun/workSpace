 (function() {

     var tool = {

         ajax: function(options) {
             var ops = {
                 url: '',
                 type: 'GET',
                 data: {},
                 success: function() {},
                 error: function() {
                     tool.toast('网络异常，请稍后重试！');
                 },
                 complete: function() {}
             };

             $.extend(ops, options);
             $.ajax({
                 url: ops.url,
                 type: ops.type,
                 data: ops.data,
                 success: ops.success,
                 error: ops.error,
                 complete: ops.complete
             });
         },

         getSessionStorage: function(name) {
             return JSON.parse(window.sessionStorage.getItem(name));
         },

         setSessionStorage: function(name, value) {
             window.sessionStorage.setItem(name, JSON.stringify(value));
         },

         //获取URL中所有的参数，返回一个key-value对象
         getUrlParameters: function() {
             var urlParameters = {};
             decodeURIComponent(window.location.href).replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                 urlParameters[key] = value;
             });
             return urlParameters;
         },

         getStyle: function(url, successCallback) {
             var options = {
                 url: url,
                 success: successCallback
             };
             tool.ajax(options);
         },

         setStyle: function(styleText) {
             var style = document.createElement('style');
             style.type = 'text/css';
             style.innerHTML = styleText;
             document.getElementsByTagName('head')[0].appendChild(style);
         },

         toast: function(text, timeRemove) {
             var time = timeRemove || 3000,
                 html = '<div class="toast">' + text + '</div>';

             if ($('.toast').length === 0) {
                 $('body').append(html);
                 setTimeout(function() {
                     $('.toast').remove();
                 }, time);
             }
         },

         getTemplate: function(productData, stepPage, index) {
             var dir = {
                 health: {
                     step01: 'template/health/template-step01/',
                     step02: 'template/health/template-step02/',
                     step03: 'template/health/template-step03/'
                 },
                 property: {
                     step01: 'template/property/template-step01/',
                     step02: 'template/property/template-step02/',
                     step03: 'template/property/template-step03/'
                 },
                 newGeneration: {
                     step01: 'template/newGeneration/template-step01/',
                     step02: 'template/newGeneration/template-step02/'
                 }
             };

             var templateType = productData.templateType;
             var template = productData.template;
             var stepPages = tool.getSessionStorage('stepPages');

             if (stepPages && stepPages[stepPage]) {
                 $('body').append(stepPages[stepPage]);
             } else {
                 var templateUrl = dir[templateType][stepPage] + template.split('|')[index - 1] + '/index.html';
                 var options = {
                     url: templateUrl,
                     success: function(data) {
                         var stepPages = JSON.parse(window.sessionStorage.getItem('stepPages')) || {};
                         stepPages[stepPage] = data;
                         $('body').append(data);
                         window.sessionStorage.setItem('stepPages', JSON.stringify(stepPages));
                     }
                 };
                 tool.ajax(options);
             }
         },

         getScript: function(url) {
             var body = document.getElementsByTagName('body')[0];
             var js = document.createElement('script');

             js.setAttribute('type', 'text/javascript');
             js.setAttribute('src', url);
             body.appendChild(js);
         }

     };

     window.tool = tool;
 })(window);

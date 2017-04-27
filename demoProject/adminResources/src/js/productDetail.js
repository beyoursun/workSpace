$(function() {

    var urlParameters = window.tool.getUrlParameters();
    var keyCode = urlParameters.keyCode;

    if (urlParameters.flag == 'EXX') {
        window.tool.getScript('js/newProductDetail.js');
    } else {
        if (!keyCode) {
            window.tool.toast('请在链接中配置keyCode参数');
            return false;
        }
        window.sessionStorage.clear();
        var options = {
            // url: '/icp/mobile_single_insurance/newQueryProductDetails.do',
            // type: 'POST',
            url: '../../mock/productData.json',
            type: 'GET',            
            data: $.extend({}, urlParameters),
            success: function(productData) {
                productData = typeof productData === 'object' ? productData : JSON.parse(productData);

                if (productData.code === '00') {

                    if (!productData.color) {
                        window.tool.setSessionStorage('urlParameters', urlParameters);
                        window.tool.setSessionStorage('productData', productData);
                        window.tool.getTemplate(productData, 'step01', 1);
                    } else {
                        var ops = {
                            url: productData.color,
                            success: function(themeStyle) {
                                if (themeStyle) {
                                    window.tool.setStyle(themeStyle);
                                    window.sessionStorage.setItem('themeStyle', themeStyle);
                                }
                            },
                            error: function() {},
                            complete: function() {
                                window.tool.setSessionStorage('urlParameters', urlParameters);
                                window.tool.setSessionStorage('productData', productData);
                                window.tool.getTemplate(productData, 'step01', 1);
                            }
                        };
                        window.tool.ajax(ops);
                    }

                } else {
                    window.tool.toast(productData.msg);
                }
            }
        };
        window.tool.ajax(options);
    }
});

$(function() {
	var $err = $("#err");
	var productData = JSON.parse(window.sessionStorage.getItem('productData'));
	var maxInsuranceDay = productData.planInfoList[0].localProMap.maxInsuranceDay || 0;
	var maxInsuranceMonth = productData.planInfoList[0].localProMap.maxInsuranceMonth || 0;
	var maxUnderWriteDay = productData.planInfoList[0].localProMap.maxUnderWriteDay || 0;
	var maxUnderWriteMonth = productData.planInfoList[0].localProMap.maxUnderWriteMonth || 0;
	var submit = {};
	var amount = 0;
	var maxInsurance;
	var color = window.sessionStorage.getItem('color');
	var targetPlan = []; // 满足判断条件的套餐集合的下标
	var getPriceSuccess = false;
	// 如果一个云产品包含 >＝2 个产品，则需要现实选择框, 否则不显示
	if (productData.planInfoList.length >= 2) {
		$('#productBox').show();
	} else {
		$('#productBox').hide();
	}

	if (productData && productData.planInfoList) {
		var options = '';
		for (var i = 0, len = productData.planInfoList.length; i < len; i++) {
			options += '<option value=' + i + '>' + productData.planInfoList[i].localProMap.planName + '</option>';
		}
		$('#productList').empty().append(options);
	}

	// 当产品仅包含>=2个套餐，才显示套餐名称的tab
	if (productData && productData.planInfoList[0].packageList.length >= 2) {
		$('#tcUl').show();
		$('#plans').show();
		$('#product .product-ts').css('border-bottom', '1px solid #dcdcdc');
	} else {
		$('#tcUl').hide();
		$('#plans').hide();
		$('#product .product-ts').css('border-bottom', 'none');
	}

	$('#productBox select').on('change', function() {
		calculatePrice();
		var selectedIndex = $(this).val();
		if (productData && productData.planInfoList[selectedIndex].packageList.length >= 2) {
			$('#tcUl').show();
			$('#plans').show();
			$('#product .product-ts').css('border-bottom', '1px solid #dcdcdc');
		} else {
			$('#tcUl').hide();
			$('#plans').hide();
			$('#product .product-ts').css('border-bottom', 'none');
		}

		ProductDetail.renderProductData(selectedIndex);
		showVisa(selectedIndex);
		ProductDetail.initEndDateTime();
		fillDateToPage();
	});


	showVisa(0);

	window.sessionStorage.setItem('productDetailUrl', window.location.href);

	$('#handleVisa').on('click', function() {
		var uniquedArray = unique(targetPlan);
		var planSet = $('.info-btn');
		for (var i = 0, len = planSet.length; i <= len; i++) {
			// planSet.eq(i).addClass('disabled').removeClass('.btn-active');
			planSet.eq(i).removeClass().addClass('info-btn disabled');
		}
		for (var j = 0, len = uniquedArray.length; j < len; j++) {
			planSet.eq([uniquedArray[j]]).removeClass().addClass('info-btn btn-active');
		}
		$('.info-btn.btn-active').eq(0).click();

	});
	$('#cancelVisa').on('click', function() {
		var planSet = $('.info-btn');
		planSet.each(function(index) {
			$(this).removeClass('disabled').removeClass('btn-active');
		});
		planSet.eq(0).addClass('btn-active').click();

	});


	// 进入页面判断第一个产品，遍历其下的套餐险种代码 和 liabilityCode，
	// 如果产品包含 PL03J0018 且其下 liabilityCode == CVJA019”  的保额 >= 30万，则显示签证栏。
	function showVisa(productIndex) {
		var packageList = productData.planInfoList[productIndex].packageList;
		for (var i = 0, len = packageList.length; i < len; i++) {
			// 外层循环遍历套餐列表
			var liabilityList = packageList[i].liabilityList;
			for (var j = 0; j < liabilityList.length; j++) {
				//  内层循环遍历当前套餐下的责任列表
				if (liabilityList[j].insuranceTypeCode == 'PL03J0018' && liabilityList[j].liabilityCode == 'CVJA019' && liabilityList[j].insuranceCoverage >= 300000) {
					$('#visaBox').show();
					targetPlan.push(i);
				} else {
					$('#visaBox').hide();
				}
			}
		}
	};

	function unique(array) {
		var n = [];
		for (var i = 0; i < array.length; i++) {
			if (n.indexOf(array[i]) == -1) {
				n.push(array[i]);
			}
		}
		return n;
	};

	$(document).on('click', '.close-picker', function(event) {
		checkDate();
		if (checkDate()) {
			calculatePrice();
		}
	});

	function checkDate() {
		var insuranceBeginTime = $('.ins-start-date').text().trim();
		var insuranceEndTime = $('.ins-end-date').text().trim();
		var date = ProductDetail.getLimitDate();
		var stDate = new Date(insuranceBeginTime);
		var enDate = new Date(insuranceEndTime);
		//起期是否合法 
		if (!ProductDetail.isInsuranceTimeValid(date, 'start', '保险起期')) {
			$('#insuranceDay').text('0');
			return false;
		}
		//止期是否合法
		if (!ProductDetail.isInsuranceTimeValid(date, 'end', '保险止期')) {
			$('#insuranceDay').text('0');
			return false;
		}

		fillDateToPage();

		return true;
	}

	function calculatePrice() {
		var selectedIndex = $('#productList').val() || 0; // 选择的产品下标
		var planCode; // 产品代码
		var mediaSource; 
		var packageCode = $('.tc-a.active').data('packagecode') || productData.planInfoList[0].packageList[0].packageCode; 
		if (productData) {
			mediaSource = productData.accountInfo.mediaSource;
			// 接口需要的productcode 即是这里的planCode
			planCode = productData.planInfoList[selectedIndex].localProMap.planCode; // "MP02020072",
		}
		var insuranceBeginTime = $('.ins-start-date').text().trim() +  ' 00:00:00';
		var insuranceEndTime = $('.ins-end-date').text().trim() + ' 23:59:59';
        var data = {
            "serviceId": "CAL_INSURANCE_AMOUNT",
            "requestBody": {
                "productInfoList": [
                    {
                        "baseInfo": {
                            "insuranceBeginDate": insuranceBeginTime,
                            "insuranceEndDate": insuranceEndTime,
                            "productCode": planCode, 
                            "mediaSource": 'GFWX',
                            "packageCode": packageCode  
                        },
                        "riskGroupInfoList": [
                            {
                                "combinedProductCode": planCode,
                                 "productPackageType": packageCode,
                                "applyNum": 1
                            }
                        ]
                    }
                ]
            }
        };
        $('#amount').text('计算中...');
        var url = '/icp/gatePostWay.do';
		$.ajax({
			url: url,
			type: 'POST',
			dataType: 'JSON',
			contentType: "application/json",
			data: JSON.stringify(data),
			success: function(res) {
				typeof res === 'string' && (res = JSON.parse(res));
				if (res.resultCode === '00') {
					getPriceSuccess = true;
					$('#amount').text(res.productList[0].totalActualPremium + '元');	
				} else {
					getPriceSuccess = false;
					$('#amount').text('计算保费失败');
					ErrWarn.errShow('计算保费失败, 请稍后重试');
					console.log('返回码不是00,错误描述:' + res.errorDesc);
				}
			},
			error: function(res) {
				getPriceSuccess = false;
				ErrWarn.errShow('计算保费失败, 请稍后重试');
				$('#amount').text('计算保费失败');
			}
		});
	};
	function fillDateToPage() {
		var insuranceBeginTime = $('.ins-start-date').text().trim();
		var insuranceEndTime = $('.ins-end-date').text().trim();
		// 计算两个日期之间的天数
		var days = ProductDetail.getDays(insuranceBeginTime, insuranceEndTime);
		$('#insuranceDay').text(days + '天');
	};
	var ProductDetail = {
		//保险起止日期是否有效
		isInsuranceTimeValid: function(dates, startOrEnd, toastTitle) {
			var insuranceBeginTime = $('.ins-start-date').text().trim();
			var insuranceEndTime = $('.ins-end-date').text().trim();

			if (startOrEnd === 'start') { //起期
				var result = ProductDetail.isDateInRange(insuranceBeginTime, dates.minStartDate, dates.maxStartDate, toastTitle);
			} else { //止期
				var dynamicEndDate = ProductDetail.getFutureDate(new Date(insuranceBeginTime), 0, dates.maxInsuranceMonth, dates.maxInsuranceDay - 1);
				var result = ProductDetail.isDateInRange(insuranceEndTime, insuranceBeginTime, dynamicEndDate, toastTitle);
			}

			if (!result.isDateInRange) {
				ErrWarn.errShow(result.msg);
				return false;
			}
			return true;
		},
		init: function() {
			ErrWarn.creat();
			this.scrollTop();
			this.maskClick();
			this.renderProductData();
			this.pay();
			this.clickFun();
			this.initStartDateTime();
			this.initEndDateTime();
			calculatePrice();
			fillDateToPage();
		},
		getFutureDate: function(startDate, afterYear, afterMonth, afterDay) {
			var futureDate, year, month, day;

			if (arguments.length === 3) {
				afterDay = arguments[2];
				afterMonth = arguments[1];
				afterYear = arguments[0];
				startDate = new Date(startDate);
			}

			if (arguments.length === 4 && Object.prototype.toString.call(startDate) !== "[object Date]") {
				startDate = new Date(startDate);
			}

			//计算年
			futureDate = startDate.setFullYear(startDate.getFullYear() + parseInt(afterYear));
			futureDate = new Date(futureDate);
			// 计算月
			futureDate = futureDate.setMonth(futureDate.getMonth() + parseInt(afterMonth));
			futureDate = new Date(futureDate);
			// 计算日
			futureDate = futureDate.setDate(futureDate.getDate() + parseInt(afterDay));
			futureDate = (new Date(futureDate));

			year = futureDate.getFullYear();

			month = futureDate.getMonth() + 1;
			month = month < 10 ? '0' + month : month;

			day = futureDate.getDate();
			day = day < 10 ? '0' + day : day;

			futureDate = [year, month, day].join('-');

			return futureDate;
		},
		getLimitDate: function() {

			var selectedIndex = $('#productList').val();

			var leastBeginTime = leastBeginTime ? (new Date(leastBeginTime)) : (new Date());

			//起保期
			var maxUnderWriteMonth = productData.planInfoList[selectedIndex].localProMap.maxUnderWriteMonth || 0;
			var maxUnderWriteDay = productData.planInfoList[selectedIndex].localProMap.maxUnderWriteDay || 0;

			//保险期
			var maxInsuranceMonth = productData.planInfoList[selectedIndex].localProMap.maxInsuranceMonth || 0;
			var maxInsuranceDay = productData.planInfoList[selectedIndex].localProMap.maxInsuranceDay || 0;
			//日期非空判断
				maxInsuranceMonth = maxInsuranceMonth ? maxInsuranceMonth - 0 : 0;
				maxInsuranceDay = maxInsuranceDay ? maxInsuranceDay - 0 : 0;
				maxUnderWriteMonth = maxUnderWriteMonth ? maxUnderWriteMonth - 0 : 0;
				maxUnderWriteDay = maxUnderWriteDay ? maxUnderWriteDay - 0 : 0;

			//最小起期和最小止期
			var minStartDate = ProductDetail.getFutureDate(leastBeginTime, 0, 0, 1);
			var minEndDate = ProductDetail.getFutureDate(new Date(minStartDate), 0, maxInsuranceMonth, maxInsuranceDay - 1);

			//最大起期和最大止期
			var maxStartDate = ProductDetail.getFutureDate(new Date(minStartDate), 0, maxUnderWriteMonth, maxUnderWriteDay);
			var maxEndDate = ProductDetail.getFutureDate(new Date(maxStartDate), 0, maxInsuranceMonth, maxInsuranceDay - 1);

			return {
				leastBeginTime: leastBeginTime,
				maxInsuranceMonth: maxInsuranceMonth,
				maxInsuranceDay: maxInsuranceDay,
				maxUnderWriteMonth: maxUnderWriteMonth,
				maxUnderWriteDay: maxUnderWriteDay,
				minStartDate: minStartDate, //最小起期
				minEndDate: minEndDate, //最小止期	
				maxStartDate: maxStartDate, //最大起期
				maxEndDate: maxEndDate //最大止期
			}
		},
		renderProductData: function(index) {
			var dataIndex = index || 0;
			var tchtml = '';
			var tcBtn = '';
			var length = productData.planInfoList[dataIndex].packageList.length;
			var localProMap = productData.planInfoList[dataIndex].localProMap;
			var packageList = productData.planInfoList[dataIndex].packageList;
			var width = 100 / length + '%';
			$('header .title').text(localProMap.planName);
			for (var i = 0; i < length; i++) {
				tchtml += '<li class="three" style="width:' + width + '"><a class="tc-a" data-i=' + i + ' data-packageCode=' + packageList[i].packageCode + '>' + packageList[i].packageName + '</a></li>'
				tcBtn += '<button data-i=' + i + ' class="info-btn" data-packageCode=' + packageList[i].packageCode + '>' + packageList[i].packageName + '</button>';
			};
			$("#tcUl").empty().html(tchtml);
			$("#choosePlan").empty().html(tcBtn);
			$("#show-des").text(localProMap.planDesc);
			$("#more").attr('data-code', localProMap.planCode);
			$("#productDes img").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageIntroduceUrl.split('='))[1] + '=0');
			$("#bgImg").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageTopUrl.split('='))[1] + '=0');
			$("#bgImg").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageTopUrl.split('='))[1] + '=0');
			$("#insurance img").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageNoticeUrl.split('='))[1] + '=0');
			$("#claim img").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageClaimUrl.split('='))[1] + '=0');
			$("#quesion img").attr('src', '/icp/downloadFile.do?fileName=' + (localProMap.productImageIproblemUrl.split('='))[1] + '=0');

			submit.productCode = productData.PRODUCTCODE;
			submit.planCode = localProMap.planCode;
			submit.planName = localProMap.planName;
			$('#tcUl').find('li .tc-a').eq(0).addClass('active').css('background', color);
			submit.packageCode = $('#tcUl').find('.tc-a').eq(0).attr("data-packagecode");
			$(".loading").hide();

			ProductDetail.dutyList(dataIndex, 0);
		},
		// 产品序号， 套餐序号
		dutyList: function(productIndex, planIndex) {
			var packageList = productData.planInfoList[productIndex].packageList;
			var list = packageList[planIndex].liabilityList;
			amount = packageList[planIndex].packageAmount; // 套餐价格
			var duty = '';
			for (var i = 0; i < list.length; i++) {
				var coverage = '';
				if (parseInt(list[i].insuranceCoverage) < 10000) {
					coverage += '<span class="money-icon">' + list[i].insuranceCoverage + '</span>'
				} else {
					coverage += '<span class="money-icon">' + list[i].insuranceCoverage / 10000 + '万</span>'
				};
				duty += '<li class="tc-detail-li">' + '<p class="left">' + list[i].liabilityName + '</p>' + '<p class="right">' + '' + coverage + '' + '<img src="img/btn_arrow_black_right@2x.png" alt="" class="icon-img">' + '</p>' + '</li>' + '<li  class="tc-text" style="display:none;">' + '<p>' + list[i].liabilityDesc + '</p>' + '</li>'
			};
			$("#tcDetailText").html(duty);
		},
		initStartDateTime: function() {
			var _that = this;
			var date = new Date();
			var today = date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
			today = _that.getNextDate(today, '1');
			$("#J-datePicker-start").val(today);
			$(".ins-start-date").text(today);

			var endDate = this.getFutureDate(new Date(today.replace(/-/g, "-")).getTime(), 0, maxUnderWriteMonth, maxUnderWriteDay);
				endDate = _that.getNextDate(endDate, '2');

			$("#J-datePicker-start").datetimePicker({
				title: "选择日期",
				min: today,
				max: '2100-01-01',
				yearSplit: "-",
				monthSplit: "-",
				datetimeSplit: " ",
				times: function() {
					return []
				},
				onChange: function(i, h, j) {
					setTimeout(function() {
						var chooseD = $("#J-datePicker-start").val();
						$(".ins-start-date").text(chooseD);
					}, 1000);
				}
			})
		},
		initEndDateTime: function() {
			var selectedIndex = $('#productList').val();
			var leastBeginTime = leastBeginTime ? (new Date(leastBeginTime)) : (new Date());
			//起保期
			var maxUnderWriteMonth = productData.planInfoList[selectedIndex].localProMap.maxUnderWriteMonth || 0;
			var maxUnderWriteDay = productData.planInfoList[selectedIndex].localProMap.maxUnderWriteDay || 0;

			//最小起期和最小止期
			var minStartDate = ProductDetail.getFutureDate(leastBeginTime, 0, 0, 1);
			var minEndDate = ProductDetail.getFutureDate(new Date(minStartDate), 0, maxInsuranceMonth, maxInsuranceDay - 1);
			var _that = this;
			var date = new Date();
			var today = date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
			today = _that.getNextDate(today, '1');

			$("#J-datePicker-end").val(minEndDate); // 这里需要填充默认的最大保险止期
			$(".ins-end-date").text(minEndDate);

			var endDate = this.getFutureDate(new Date(today.replace(/-/g, "-")).getTime(), 0, maxUnderWriteMonth, maxUnderWriteDay);
				endDate = _that.getNextDate(endDate, '2');

			$("#J-datePicker-end").datetimePicker({
				title: "选择日期",
				min: today,
				max: '2100-01-01',
				yearSplit: "-",
				monthSplit: "-",
				datetimeSplit: " ",
				times: function() {
					return []
				},
				onChange: function(i, h, j) {
					setTimeout(function() {
						var chooseD = $("#J-datePicker-end").val();
						$(".ins-end-date").text(chooseD);
					}, 1000);
				}
			})
		},
		isDateInRange: function(specifiedDate, startDate, endDate, title) {
			var spDate = new Date(specifiedDate);
			var stDate = new Date(startDate);
			var enDate = new Date(endDate);
			var result = {
				isDateInRange: true,
				msg: 'ok'
			};
			title = title || '日期';

			if (spDate < stDate) {
				result.isDateInRange = false;
				result.msg = title + '不能低于 ' + startDate;
			} else if (spDate > enDate) {
				result.isDateInRange = false;
				result.msg = title + '不能超过 ' + endDate;
			}
			return result;
		},
		getNextDate: function(date, id) {
			if (id == '1') {
				var nextDate = new Date(new Date(date.replace(/-/g, '/')).getTime() + 1 * 24 * 60 * 60 * 1000);
			} else {
				var nextDate = new Date(new Date(date.replace(/-/g, '/')).getTime() - 1 * 24 * 60 * 60 * 1000);
			};
			var month = nextDate.getMonth() + 1 < 10 ? '0' + (nextDate.getMonth() + 1) : nextDate.getMonth() + 1;
			var date = nextDate.getDate() < 10 ? '0' + nextDate.getDate() : nextDate.getDate();
			var returnDate = nextDate.getFullYear() + '-' + month + '-' + date;
			return returnDate;
		},
		endDate: function(chooseD, d) {
			var sec = this.dataNum(d);
			var endDateSec = (new Date(chooseD.replace(/-/g, '/'))).getTime() + sec;
			endDateSec = new Date(endDateSec);
			var endDate = endDateSec.getFullYear() + '-' + ((endDateSec.getMonth() + 1) >= 10 ? (endDateSec.getMonth() + 1) : '0' + (endDateSec.getMonth() + 1)) + '-' + (endDateSec.getDate() >= 10 ? endDateSec.getDate() : '0' + endDateSec.getDate());
			return endDate;
		},

		getDays: function(sDate1, sDate2) {
			// @para：2000-01-01
			var t1 = new Date(sDate1.replace(/-/g, "/"));
			var t2 = new Date(sDate2.replace(/-/g, "/"));
			var days = parseInt((t2.getTime() - t1.getTime()) / (1000 * 60 * 60 * 24) + 1, 10);
			return days;
		},
		getHeight: function() {
			var height = 0;
			// height = parseInt($(".show-picture").css('height'))+parseInt($("#tab1").css('height'))+parseInt($("#product").css('height'));
			height = parseInt($("#product").css('height'));
			return height;
		},
		scrollTop: function() {
			window.onscroll = function() {
				var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
				var jsH = parseInt($(".show-picture").css('height'))
				if (scrollTop >= 230) {
					$("#tab").addClass('tab');
					$("#tab").show();
				} else {
					$("#tab").hide();
					$("#tab").removeClass('tab');
				};
				$('.a').removeClass('a-active');
				if (0 <= scrollTop && scrollTop < 371) {
					$("#js").addClass('a-active');
					$("#js-fixed").addClass('a-active');
				} else if (371 <= scrollTop && scrollTop < 765) {
					$("#tx-fixed").addClass('a-active');
				} else if (765 <= scrollTop && scrollTop <= 1134) {
					$("#lz-fixed").addClass('a-active');
				} else {
					$("#cj-fixed").addClass('a-active');
				};
			};
		},
		pay: function() {
			var _that = this;
			$("#pay").on('click', function() {
				if ($("#mask").css('display') == 'none') {
					$(".info").css("bottom", "-500px");
					$("#mask").show();
					_that.animateFun('1');
				} else {

					if (!$('#selectCityDIV').val()) {
						ErrWarn.errShow('请选择目的地');
						return false;
					}
					if (!checkDate()) {
						return false;
					}

					if (!getPriceSuccess) {
						ErrWarn.errShow('计算保费失败, 请稍后重试');
						return false;
					}

					if ($('input[name="applyForVisa"]:checked').val() === 'Y') {
						submit.showPaper = true;
					} else {
						submit.showPaper = false;
					}
					if ($('#tcUl').css('display') === '-webkit-box' && $('.info-btn.btn-active').length === 0) {
						ErrWarn.errShow('请选择套餐');
						return false;
					}
					$("#pay").css('background', '#dcdcdc').text('正在投保...');
					submit.packageCode = $('.tc-a.active').data('packagecode');
					submit.destination = $('#selectCityDIV').val();
					submit.insuranceBeginTime = $.trim($("#J-datePicker-start").val());
					submit.insuranceEndTime = $.trim($("#J-datePicker-end").val());
					submit.amount = $("#amount").text().slice(0,$("#amount").text().length-1);
					window.sessionStorage.setItem('submit', JSON.stringify(submit));
					window.sessionStorage.removeItem('applicantInfo');
					window.location.href = 'applicant.html';
				}
			});
		},
		animateFun: function(num) {
			var bottom = parseInt($(".info").css('bottom')),
				time = null;
			if (num == '1') {
				time = setInterval(function() {
					bottom += 50;
					$(".info").css('bottom', bottom + 'px');
					if (bottom == '50') {
						clearInterval(time);
					};
				}, 10);
			} else {
				time = setInterval(function() {
					bottom -= 50;
					$(".info").css('bottom', bottom + 'px');
					if (bottom == '-500') {
						var amount = $("#amount").text().slice(0, $("#amount").text().length - 1) / parseInt($("#inputNum").val() || 1);
						$("#amount").text(amount + '元');
						$("#inputNum").val("1");
						$("#mask").hide();
						clearInterval(time);
					};
				}, 10);
			};
			$(".info").show();
		},
		changeActive: function(code) {
			$('.tc-a').removeClass('active').css('background', '#fff');
			$('.info-right button').removeClass('btn-active');
			$('.tc-a').eq(code).addClass('active').css('background', color);
			$('.info-right button').eq(code).addClass('btn-active').css('background', color);
		},
		getAmount: function(amount, num) {
			var per = amount * num;
			$("#amount").text(per + '元');
		},
		clickFun: function() {
			var _that = this;
			$("body").on('click', '.a', function() {
				$('.a').removeClass('a-active');
				var $this = $(this);
				var ids = $this.attr('data-id');
				$this.addClass('a-active');
				if (ids === '01') {
					document.body.scrollTop = 212;
				} else if (ids === '02') {
					document.body.scrollTop = 560;
				} else if (ids === '03') {
					document.body.scrollTop = 920;
				} else {
					document.body.scrollTop = 1328;
				}
			});
			// 保障方案
			$("body").on('click', '.info-right button', function() {
				calculatePrice();
				$('.info-right button').removeClass('btn-active');
				var $this = $(this);
				var i = $this.attr('data-i');
				$this.addClass('btn-active').css('background', color);
				submit.packageCode = $this.attr('data-packageCode');
				ProductDetail.dutyList($('#productBox select').val(), i);
				ProductDetail.changeActive(i)
			});
			// 套餐
			$("body").on('click', '.tc-a', function() {
				calculatePrice();
				$('.tc-a').removeClass('active');
				var $this = $(this);
				var i = $this.attr('data-i');
				$this.addClass('active').css('background', color);
				ProductDetail.dutyList($('#productBox select').val(), i);
				ProductDetail.changeActive(i)
			})
			$("body").on('click', '.right', function() {
				var $this = $(this),
					li = $this.parent().next();
				if (li.css('display') == 'none') {
					li.show();
				} else {
					li.hide();
				}
			});
			$("#more").on('click', function() {
				$("#body").scrollTop(0);
				var code = $("#more").attr('data-code')
				_that.announcement(1, code);
			});
		},
		maskClick: function() {
			var _that = this;
			$('body').on('click', '.mask', function() {
				_that.animateFun('2');
			});
			$('body').on('click', '#cancel', function() {
				_that.animateFun('2');
			});
		},
		announcement: function(id, code) {
			var g, d, h, i, j, f, k, planCode, protocal;
			switch (id) {
			case 1:
				g = "保险条款";
				d = "";
				h = "#sytk";
				j = document.createElement("iframe");
				planCode = code;
				protocal = window.location.href.indexOf('https') === 0 ? 'https' : 'http';
				k = protocal + '://' + window.location.host + '/icp_core_dmz/web/' + planCode + '.html';
				j.setAttribute("id", "miuisProvision");
				$("#hideInsuranceClause").append(j);
				$("#miuisProvision").attr("src", k);
				break;
			}
			$("#title").html(g);
			$("#hideContent").html(d);
			$(".contaitent").hide();
			$(".footer").hide();
			$("#hideInsuranceClause").show();
			window.history.pushState({
				title: h
			}, h, window.location.href + h);
			window.onpopstate = function(e) {
				$("#miuisProvision").remove();
				$("#hideInsuranceClause").hide();
				$(".contaitent").show();
				$(".footer").show();
			};
		}
	};
	ProductDetail.init();
})
"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Excel = require("./components/Excel");

var _Excel2 = _interopRequireDefault(_Excel);

var _Logo = require("./components/Logo");

var _Logo2 = _interopRequireDefault(_Logo);

var _Button = require("./components/Button");

var _Button2 = _interopRequireDefault(_Button);

var _Suggest = require("./components/Suggest");

var _Suggest2 = _interopRequireDefault(_Suggest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var headers = localStorage.getItem('headers');
var data = localStorage.getItem('data');

if (!headers) {
	headers = ['Title', 'Year', 'Rating', 'Comments'];
	data = [['Test', '2015', '3', 'meh']];
}

_reactDom2.default.render(_react2.default.createElement(
	"div",
	{ style: { padding: '20px' } },
	_react2.default.createElement(
		"h1",
		null,
		" Logo",
		_react2.default.createElement(_Logo2.default, null)
	),
	_react2.default.createElement(
		"h2",
		null,
		"Button"
	),
	_react2.default.createElement(
		"div",
		null,
		"Button with onClick:",
		_react2.default.createElement(
			_Button2.default,
			{ onClick: function onClick() {
					return console.log('outch');
				} },
			" click me "
		)
	),
	_react2.default.createElement(
		"div",
		null,
		"A link:",
		_react2.default.createElement(
			_Button2.default,
			{ href: "xxx.com" },
			" Follow me "
		)
	),
	_react2.default.createElement(
		"div",
		null,
		"Button className",
		_react2.default.createElement(
			_Button2.default,
			{ className: "custom" },
			" I do nothing "
		)
	),
	_react2.default.createElement(
		"div",
		null,
		"Suggest:",
		_react2.default.createElement(_Suggest2.default, { options: ['eenie', 'meenie', 'miney', 'mo'] })
	)
), document.getElementById('pad'));
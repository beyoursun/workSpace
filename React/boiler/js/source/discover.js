"use strict";

import React from "react";
import ReactDOM from "react-dom";
import Excel from './components/Excel';
import Logo from './components/Logo';
import Button from './components/Button';
import Suggest from './components/Suggest';

var headers = localStorage.getItem('headers');
var data = localStorage.getItem('data');

if (!headers) {
  headers = ['Title', 'Year', 'Rating', 'Comments'];
  data = [['Test', '2015', '3', 'meh']];
}

ReactDOM.render(
	 <div style={{padding: '20px'}}>
		<h1> Logo
			<Logo/>

		</h1>

		<h2>Button</h2>
		<div>
			Button with onClick:
			<Button onClick={()=>console.log('outch')}> click me </Button>
		</div>
		<div>
			A link:
			<Button  href="xxx.com"> Follow me </Button>
		</div>
		<div>
			Button className
			<Button  className="custom"> I do nothing </Button>
		</div>
		<div>
			Suggest:
			<Suggest options={['eenie', 'meenie', 'miney', 'mo']} />
		</div>				
	</div>,
	document.getElementById('pad')
);

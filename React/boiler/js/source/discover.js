"use strict";

import React from "react";
import ReactDOM from "react-dom";
import Excel from './components/Excel';
import Logo from './components/Logo';
import Button from './components/Button';
import Suggest from './components/Suggest';
import Rating from './components/Rating';

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
		<div>
		    <h2>Rating</h2>
		    <div>No initial value: <Rating /></div>
		    <div>Initial value 4: <Rating defaultValue={4} /></div>
		    <div>This one goes to 11: <Rating max={11} /></div>
		    <div>Read-only: <Rating readonly={true} defaultValue={3} /></div>
		    	
		</div>				
	</div>,
	document.getElementById('pad')
);

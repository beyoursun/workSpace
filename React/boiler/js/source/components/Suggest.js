// import React from "react";
// const Component = React.Component;
// const PropTypes = React.PropTypes;

// 新语法：
import React, {Component, PropTypes} from "react";

class Suggest extends Component {

	constructor(props) {
		super(props);
		this.state = {value: this.props.defaultValue || ''}; // 替代了原有的getinitialState()函数
	}
  
	getValue() {
		return this.state.value;
	}

	render() {
		const rendomid = Math.random().toString(16).substring(2);
		return(
			<div>
				<input
					list = {rendomid}
					defaultValue = {this.props.defaultValue}
					onChange={e=>this.setState({value:e.target.value})}
					id={this.props.id}/>
					<datalist id={rendomid}> {
						this.props.options.map((item, idx)=>
							<option value={item} key={idx} />
						)
					}	
					</datalist>					
			</div>

		)
	}
}

export default Suggest




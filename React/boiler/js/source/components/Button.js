"use strict";

import React, {PropTypes} from "react";
import classNames from "classnames";

function Button(props) {
	const cssclasses = classNames('Button', props.className);
	return props.href 
		   ? <a {...props} className={cssclasses}/>
		   : < button {...props} className={cssclasses} />;
}

Button.PropTypes = {
	href: PropTypes.string
};

export default Button
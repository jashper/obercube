import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import { Action, Dispatch } from '../actions/action';
import { MouseAction, Coordinates } from '../actions/mouse';
import InputController from '../input-controller';

interface DispatchProps {
	click(point: Coordinates): void;
}

type Props = DispatchProps;
class View extends React.Component<Props, {}> {
	readonly width = 500;
	readonly height = 500;

	refs: {
		[key: string]: Element;
		canvas: HTMLInputElement;
	}

	render() {
		return (
			<div>
				<h2> This is a test canvas</h2>
				<canvas ref='canvas' id='canvas'
						width={this.width} height={this.height}
						onClick={e => this.onCanvasClick(e)} />
				<InputController />
			</div>
		);
	}

	onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
		// determine the coordinates of the click
		const rect = this.refs.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		this.props.click({ x, y });
	}
}

function mapDispatchToProps(dispatch: Dispatch) {
	return {
		click: bindActionCreators(MouseAction.click, dispatch)
	}
}

export default connect(this, mapDispatchToProps)(View as any);

import * as React from 'react';
import { connect } from 'react-redux';

import { InputStateRecord } from './state/input';
import { StoreRecords } from './state/reducers';

interface StateProps {
	input: InputStateRecord;
}

type Props = StateProps;
class InputController extends React.Component<Props, {}> {
	componentDidUpdate(prevProps: Props) {
		const input = this.props.input;
		const prevInput = prevProps.input;

		const clickPoint = input.clickPoint;
		const prevClickPoint = prevInput.clickPoint;

		// has a click occured
		if (clickPoint !== prevClickPoint) {
			const { x, y } = clickPoint;
		}
	}

	render() {
		return null;
	}
}

function mapStateToProps(state: StoreRecords) {
	return { 
		input: state.input
	};
};

export default connect(mapStateToProps)(InputController);

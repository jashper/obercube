import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StoreRecords } from './state/reducers';
import { Dispatch, Coordinates } from './actions/action';
import { MouseAction } from './actions/mouse';

interface StateProps {}

interface DispatchProps {
    mouseClick(point: Coordinates): void;
}

interface Props extends StateProps, DispatchProps {}

class InputController extends React.Component<Props, {}> {
    componentDidMount() {
        window.onclick = this.onClick.bind(this);
    }

    render() {
        return null;
    }

    onClick(ev: MouseEvent) {
        // determine the coordinates of the click
        const rect = window.document.body.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        this.props.mouseClick({ x, y });
    }
}

function mapStateToProps(state: StoreRecords) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        mouseClick: bindActionCreators(MouseAction.click, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InputController as any);

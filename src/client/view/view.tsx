import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { StoreRecords } from '../state/reducers';
import { Dispatch } from '../actions/action';
import { MouseAction, Coordinates } from '../actions/mouse';

interface StateProps {}

interface DispatchProps {
    click(point: Coordinates): void;
}

interface Props extends StateProps, DispatchProps {}

class View extends React.Component<Props, {}> {
    readonly width = 500;
    readonly height = 500;

    refs: {
        [key: string]: Element;
        canvas: HTMLInputElement;
    };

    render() {
        return (
            <div>
                <h2> This is a test canvas</h2>
                <canvas ref='canvas' id='canvas'
                        width={this.width} height={this.height}
                        onClick={(e) => this.onCanvasClick(e)} />
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

function mapStateToProps(state: StoreRecords) {
    return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        click: bindActionCreators(MouseAction.click, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View as any);

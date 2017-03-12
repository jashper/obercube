import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import Constants from '../../constants';
import { StoreRecords } from '../state/reducers';
import { Coordinates, Dispatch, Delta } from '../../action';
import { ViewportStateRecord } from '../state/viewport';
import { MouseAction } from '../actions/mouse';
import { WindowAction } from '../actions/window';

interface StateProps {
    viewport: ViewportStateRecord;
}

interface DispatchProps {
    mouseClick(point: Coordinates): void;
    mouseWheel(ev: WheelEvent): void;
    startPan(delta: Delta): void;
    endPan(): void;
}

interface Props extends StateProps, DispatchProps {}

class MouseHandler extends React.Component<Props, {}> {
    isPanning = false;
    panDelta: Delta = { dx: 0, dy: 0 };

    componentDidMount() {
        Observable.fromEvent(window, 'click')
            .subscribe({
                next: (ev: MouseEvent) => this.onClick(ev)
            });

        Observable.fromEvent(window, 'wheel')
            .debounceTime(10)
            .subscribe({
                next: (ev: WheelEvent) => this.onWheel(ev)
            });

        Observable.fromEvent(window, 'mousemove')
            .subscribe({
                next: (ev: MouseEvent) => this.onMouseMove(ev)
            });
    }

    render() {
        return null;
    }

    private onClick(ev: MouseEvent) {
        this.props.mouseClick({ x: ev.clientX, y: ev.clientY });
    }

    private onMouseMove(ev: MouseEvent) {
        const newDelta = this.getPanDelta(ev.clientX, ev.clientY);

        const { dx, dy } = newDelta;
        if (dx === 0 && dy === 0 && this.isPanning) {
            this.isPanning = false;
            this.props.endPan();
        } else if (dx !== this.panDelta.dx || dy !== this.panDelta.dy) {
            this.isPanning = true;
            this.props.startPan(newDelta);
        }

        this.panDelta = newDelta;
    }

    private onWheel(ev: WheelEvent, itr: number = 0) {
        ev.preventDefault();

        this.props.mouseWheel(ev);
    }

    private getPanDelta(x: number, y: number): Delta {
        let dx = 0, dy = 0;
        const bound = Constants.PAN_BOUNDARY_PIXELS;

        if (x < bound) {
            dx = 1;
        } else if (x > this.props.viewport.width - bound) {
            dx = -1;
        }

        if (y < bound) {
            dy = 1;
        } else if (y > this.props.viewport.height - bound) {
            dy = -1;
        }

        return { dx: dx * 10, dy: dy * 10 };
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        mouseClick: bindActionCreators(MouseAction.click, dispatch),
        mouseWheel: bindActionCreators(MouseAction.wheel, dispatch),
        startPan: bindActionCreators(WindowAction.startPan, dispatch),
        endPan: bindActionCreators(WindowAction.endPan, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MouseHandler as any);

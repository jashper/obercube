import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Delta } from '../../action';
import Constants from '../../constants';
import { MouseAction } from '../actions/mouse';
import { WindowAction } from '../actions/window';
import { ClientStore } from '../state/reducers';

interface StateProps extends ReturnType<typeof mapStateToProps> {}
interface DispatchProps extends ReturnType<typeof mapDispatchToProps> {}

interface Props extends StateProps, DispatchProps {}

class MouseHandler extends React.Component<Props, {}> {
    private isPanning: Boolean = false;
    private panDelta: Delta = { dx: 0, dy: 0 };

    componentDidMount() {
        fromEvent(window, 'click')
            .subscribe({
                next: (ev: MouseEvent) => this.onClick(ev)
            });

        fromEvent(window, 'wheel')
            .pipe(
                debounceTime(10)
            ).subscribe({
                next: (ev: WheelEvent) => this.onWheel(ev)
            });

        fromEvent(window, 'mousemove')
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

function mapStateToProps(state: ClientStore) {
    return {
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(
        {
            mouseClick: MouseAction.click,
            mouseWheel: MouseAction.wheel,
            startPan: WindowAction.startPan,
            endPan: WindowAction.endPan
        },
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(MouseHandler);

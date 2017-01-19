import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import Constants from './constants';
import { StoreRecords } from './state/reducers';
import { Dispatch } from './actions/action';
import { ViewportStateRecord } from './state/viewport';
import { MouseAction } from './actions/mouse';
import { WindowAction } from './actions/window';

interface StateProps {
    viewport: ViewportStateRecord;
}

interface DispatchProps {
    mouseWheel(ev: WheelEvent): void;
    startPan(theta: number): void;
    endPan(): void;
}

interface Props extends StateProps, DispatchProps {}

class MouseController extends React.Component<Props, {}> {
    private isPanning = false;
    private panningTheta = 0;

    componentDidMount() {
        // window.onclick = this.onClick.bind(this);

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

    // private onClick(ev: MouseEvent) {
    //     const x = ev.clientX;
    //     const y = ev.clientY;
    // }

    private onMouseMove(ev: MouseEvent) {
        const activePan = this.checkPanning(ev.clientX, ev.clientY);
        if (!activePan && this.isPanning) {
            this.isPanning = false;
            this.props.endPan();
        } else if (activePan) {
            const theta = this.getPanningTheta(ev.clientX, ev.clientY);
            if (this.isPanning && theta === this.panningTheta) {
                return;
            }

            this.isPanning = true;
            this.panningTheta = theta;
            this.props.startPan(theta);
        }
    }

    private onWheel(ev: WheelEvent, itr: number = 0) {
        ev.preventDefault();

        this.props.mouseWheel(ev);
    }

    private checkPanning(x: number, y: number) {
        const r = Constants.PAN_BOUNDARY_RADIUS_PERCENT *
           Math.min(this.props.viewport.width, this.props.viewport.height) / 2;
        return Math.pow(x - this.props.viewport.width / 2, 2) +
            Math.pow(y - this.props.viewport.height / 2, 2) > r * r;
    }

    private getPanningTheta(x: number, y: number): number {
        return Math.atan2((this.props.viewport.height / 2 - y), (this.props.viewport.width / 2 - x));
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        mouseWheel: bindActionCreators(MouseAction.wheel, dispatch),
        startPan: bindActionCreators(WindowAction.startPan, dispatch),
        endPan: bindActionCreators(WindowAction.endPan, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MouseController as any);

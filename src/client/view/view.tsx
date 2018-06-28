import * as PIXI from 'pixi.js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Dimensions} from '../../action';
import { WindowAction } from '../actions/window';
import { ClientStore } from '../state/reducers';

import Constants from '../../constants';
import MouseHandler from './mouse-handler';
import WebSocketHandler from './web-socket-handler';

interface StateProps extends ReturnType<typeof mapStateToProps> {}
interface DispatchProps extends ReturnType<typeof mapDispatchToProps> {}

interface Props extends StateProps, DispatchProps {}

class View extends React.Component<Props, {}> {
    private minWidth = 640;
    private minHeight = 480;

    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

    refs: {
        canvas: HTMLCanvasElement;
    };

    componentDidMount() {
        // create the stage to be rendered
        this.stage = new PIXI.Container();

        // setup the canvas renderer
        const dimensions = this.getWindowDimensions();
        this.renderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
            view: this.refs.canvas,
            antialias: true,
            autoResize: true,
            backgroundColor: Constants.BACKGROUND_COLOR,
            resolution: window.devicePixelRatio || 1
        });

        // start the main render loop
        this.props.startAnimation({stage: this.stage, renderer: this.renderer});

        // setup an observable to listen for window resizes
        this.props.windowResize(dimensions);
        this.onWindowResize();
    }

    render() {
        return (
            <div>
                <MouseHandler />
                <WebSocketHandler />
                <canvas ref='canvas' style={{ position: 'absolute', display: 'block' }} />
            </div>
        );
    }

    private getWindowDimensions(): Dimensions {
        return {
            width: Math.max(this.minWidth, window.innerWidth),
            height: Math.max(this.minHeight, window.innerHeight)
        };
    }

    // TODO: intercept browser zooms, and trigger a MOUSE_WHEEL event instead
    private onWindowResize() {
        fromEvent(window, 'resize')
            .pipe(
                debounceTime(75)
            ).subscribe({
                next: () => {
                    const dimensions = this.getWindowDimensions();
                    this.props.windowResize(dimensions);
                    this.renderer.resize(dimensions.width, dimensions.height);
                }
            });
    }
}

function mapStateToProps(state: ClientStore) {
    return {
        game: state.game
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return bindActionCreators(
        {
            windowResize: WindowAction.resize,
            startAnimation: WindowAction.startAnimation
        },
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(View);

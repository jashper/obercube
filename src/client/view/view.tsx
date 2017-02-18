import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Dimensions, RendererInfo} from '../../action';
import { GameStateRecord } from '../state/game';
import { WindowAction } from '../actions/window';

import Constants from '../../constants';
import MouseController from '../mouse-controller';
import WebSocketController from '../web-socket-controller';

interface StateProps {
    game: GameStateRecord;
}

interface DispatchProps {
    windowResize(dimensions: Dimensions): void;
    startAnimation(info: RendererInfo): void;
}

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
            resolution: window.devicePixelRatio
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
                <MouseController />
                <WebSocketController />
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
        Observable.fromEvent(window, 'resize')
            .debounceTime(75)
            .subscribe({
                next: () => {
                    const dimensions = this.getWindowDimensions();
                    this.props.windowResize(dimensions);
                    this.renderer.resize(dimensions.width, dimensions.height);
                }
            });
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        game: state.game
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        windowResize: bindActionCreators(WindowAction.resize, dispatch),
        startAnimation: bindActionCreators(WindowAction.startAnimation, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View as any);

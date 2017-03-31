import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Dimensions, RendererInfo} from '../../action';
import { GameStateRecord } from '../state/game';
import { WindowAction } from '../actions/window';

import Constants from '../../constants';
import MouseHandler from './mouse-handler';
import WebSocketHandler from './web-socket-handler';

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
    private UIrenderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private renderer: THREE.WebGLRenderer;

    refs: {
        UI: HTMLCanvasElement;
        scene: HTMLCanvasElement;
    };

    componentDidMount() {
        // create the stage to be rendered
        this.stage = new PIXI.Container();

        // setup the UI canvas renderer
        const dimensions = this.getWindowDimensions();
        this.UIrenderer = PIXI.autoDetectRenderer(dimensions.width, dimensions.height, {
            view: this.refs.UI,
            antialias: true,
            autoResize: true,
            transparent: true,
            backgroundColor: Constants.BACKGROUND_COLOR,
            resolution: window.devicePixelRatio
        });

        // setup the THREEJS renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.refs.scene
        });
        this.renderer.setSize(dimensions.width, dimensions.height);

        // start the main render loop
        this.props.startAnimation({
            dimensions: dimensions,
            stage: this.stage,
            UIrenderer: this.UIrenderer,
            renderer: this.renderer
        });

        // setup an observable to listen for window resizes
        this.props.windowResize(dimensions);
        this.onWindowResize();
    }

    render() {
        return (
            <div>
                <MouseHandler />
                <WebSocketHandler />
                <canvas ref='scene' style={{ position: 'absolute', display: 'block' }} />
                <canvas ref='UI' style={{ position: 'absolute', display: 'block' }} />
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
                    this.UIrenderer.resize(dimensions.width, dimensions.height);
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

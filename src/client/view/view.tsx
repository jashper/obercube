import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Dimensions } from '../actions/action';
import { ViewportStateRecord } from '../state/viewport';
import { WindowAction } from '../actions/window';
import { MatchAction, MatchInfo } from '../actions/match';

import Constants from '../constants';
import InputController from '../input-controller';
import OutpostLayer from './outpost-layer';

interface StateProps {
    viewport: ViewportStateRecord;
}

interface DispatchProps {
    windowResize(dimensions: Dimensions): void;
    newMatch(info: MatchInfo): void;
}

interface Props extends StateProps, DispatchProps {}

interface State {
    tick: number;
}

class View extends React.Component<Props, State> {
    private minWidth = 640;
    private minHeight = 480;

    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

    refs: {
        canvas: HTMLCanvasElement;
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            tick: 0
        };
    }

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

        // setup an observable to listen for window resizes
        this.props.windowResize(dimensions);
        this.onWindowResize();

        // TODO: remove this
        this.props.newMatch({mapWidth: 2000, mapHeight: 2000 });

        // start the main render loop
        this.animate();
    }

    componentWillReceiveProps(nextProps: Props) {
        const { width, height } = nextProps.viewport;
        if (width !== this.props.viewport.width || height !== this.props.viewport.height) {
            this.renderer.resize(width, height);
            return;
        }

        const { scale } = nextProps.viewport;
        if (scale !== this.props.viewport.scale) {
            this.stage.scale.set(scale, scale);
        }
    }

    render() {
        return (
            <div>
                <InputController />
                <canvas ref='canvas' style={{position: 'absolute', display: 'block'}} />
                <OutpostLayer tick={this.state.tick} stage={this.stage}/>
            </div>
        );
    }

    private getWindowDimensions(): Dimensions {
        return {
            width: Math.max(this.minWidth, window.innerWidth),
            height: Math.max(this.minHeight, window.innerHeight)
        };
    }

    private onWindowResize() {
        Observable.fromEvent(window, 'resize')
            .debounceTime(75)
            .subscribe({
                next: () => {
                    const dimensions = this.getWindowDimensions();
                    this.props.windowResize(dimensions);
                }
            });
    }

    private animate() {
        this.setState({ tick: this.state.tick + 1 });
        this.renderer.render(this.stage);
        requestAnimationFrame(this.animate.bind(this));
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        windowResize: bindActionCreators(WindowAction.resize, dispatch),
        newMatch: bindActionCreators(MatchAction.new, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View as any);

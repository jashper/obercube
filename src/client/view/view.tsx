import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Dimensions } from '../actions/action';
import { MapStateRecord } from '../state/map';
import { ViewportStateRecord } from '../state/viewport';
import { WindowAction } from '../actions/window';
import { MatchAction, MatchInfo } from '../actions/match';
import { SpawnAction, SpawnInfo } from '../actions/spawn';

import Constants from '../constants';
import InputController from '../input-controller';

interface StateProps {
    map: MapStateRecord;
    viewport: ViewportStateRecord;
}

interface DispatchProps {
    windowResize(dimensions: Dimensions): void;
    startAnimation(stage: PIXI.Container): void;
    render(): void;
    newMatch(info: MatchInfo): void;
    spawnOutpost(info: SpawnInfo): void;
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

        // TODO: remove this
        this.props.newMatch({mapWidth: 2000, mapHeight: 2000 });

        // setup an observable to listen for window resizes
        this.props.windowResize(dimensions);
        this.onWindowResize();

        this.props.startAnimation(this.stage);

        // start the main render loop
        this.animate();
    }

    // TODO: remove this
    componentDidUpdate(prevProps: Props, prevState: {}) {
        const min = 0;
        const max = 8;

        // wait for the map to load
        if (this.props.map.width !== prevProps.map.width) {
            for (let x = 50; x < 2000; x += 100) {
                for (let y = 50; y < 2000; y += 100) {
                    let color = 0;
                    switch (Math.ceil(Math.random() * (max - min) + min)) {
                        case 1:
                            color = Constants.COLORS.LAVENDER;
                            break;
                        case 2:
                            color = Constants.COLORS.LIGHT_BLUE;
                            break;
                        case 3:
                            color = Constants.COLORS.LIME_GREEN;
                            break;
                        case 4:
                            color = Constants.COLORS.ORANGE;
                            break;
                        case 5:
                            color = Constants.COLORS.RADICAL_RED;
                            break;
                        case 6:
                            color = Constants.COLORS.SEAFOAM_GREEN;
                            break;
                        case 7:
                            color = Constants.COLORS.TAN;
                            break;
                        case 8:
                            color = Constants.COLORS.WHITE;
                            break;
                        default:
                            break;
                    }

                    this.props.spawnOutpost({ x, y, color });
                }
            }
        }
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
        this.props.render();
        this.renderer.render(this.stage);
        requestAnimationFrame(this.animate.bind(this));
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        map: state.map,
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        windowResize: bindActionCreators(WindowAction.resize, dispatch),
        startAnimation: bindActionCreators(WindowAction.startAnimation, dispatch),
        render: bindActionCreators(WindowAction.render, dispatch),
        newMatch: bindActionCreators(MatchAction.new, dispatch),
        spawnOutpost: bindActionCreators(SpawnAction.outpost, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View as any);

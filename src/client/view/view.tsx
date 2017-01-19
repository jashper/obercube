import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Dimensions, RendererInfo} from '../actions/action';
import { MapStateRecord } from '../state/map';
import { WindowAction } from '../actions/window';
import { MatchAction, MatchInfo } from '../actions/match';
import { SpawnAction, SpawnInfo } from '../actions/spawn';

import Constants from '../constants';
import MouseController from '../mouse-controller';

interface StateProps {
    map: MapStateRecord;
}

interface DispatchProps {
    windowResize(dimensions: Dimensions): void;
    startAnimation(info: RendererInfo): void;
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
        this.props.newMatch({mapWidth: 5000, mapHeight: 5000 });

        // start the main render loop
        this.props.startAnimation({stage: this.stage, renderer: this.renderer});

        // setup an observable to listen for window resizes
        this.props.windowResize(dimensions);
        this.onWindowResize();
    }

    // TODO: remove this
    componentDidUpdate(prevProps: Props, prevState: {}) {
        const min = 0;
        const max = 8;

        // wait for the map to load
        let canSpawn = true;
        if (this.props.map.width !== prevProps.map.width) {
            for (let x = 100; x < 5000; x += 240) {
                for (let y = 100; y < 5000; y += 240) {
                    if (Math.random() > 0.5) {
                        continue;
                    }

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
                    canSpawn = false;
                }
            }
        }
    }

    render() {
        return (
            <div>
                <MouseController />
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
        map: state.map
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        windowResize: bindActionCreators(WindowAction.resize, dispatch),
        startAnimation: bindActionCreators(WindowAction.startAnimation, dispatch),
        newMatch: bindActionCreators(MatchAction.new, dispatch),
        spawnOutpost: bindActionCreators(SpawnAction.outpost, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View as any);

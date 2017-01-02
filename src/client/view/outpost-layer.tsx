import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as PIXI from 'pixi.js';

import { StoreRecords } from '../state/reducers';
import { Dispatch, Outpost, DrawableState } from '../actions/action';
import { MapStateRecord } from '../state/map';
import { OutpostStateRecord } from '../state/outpost';
import { ViewportStateRecord } from '../state/viewport';
import { RenderAction } from '../actions/render';
import { ViewElementGrid, ViewElement, ElementVisibility } from './view-element-grid';
import Constants from '../constants';

interface StateProps {
    map: MapStateRecord;
    outpost: OutpostStateRecord;
    viewport: ViewportStateRecord;
}

interface DispatchProps {
    render(): void;
}

interface SelfProps {
    tick: number;
    stage: PIXI.Container;
}

interface Props extends StateProps, DispatchProps, SelfProps {}

class OutpostLayer extends React.Component<Props, {}> {
    private grid = new ViewElementGrid<OutpostElement>(100);
    private activeElements = new Set<number>();

    componentWillReceiveProps(nextProps: Props) {
        const { width: mapWidth, height: mapHeight } = nextProps.map;
        const { width: viewWidth, height: viewHeight } = nextProps.viewport;
        const { x, y } = nextProps.viewport;
        if (mapWidth !== this.props.map.width || mapHeight !== this.props.map.height) {
            this.grid.init(mapWidth, mapHeight, viewWidth, viewHeight, x, y);
        }

        const { scale } = nextProps.viewport;
        if (scale !== this.props.viewport.scale) {
            // TODO: scale the grid
            this.updateVisiblity({});
        } else {
            if (viewWidth !== this.props.viewport.width || viewHeight !== this.props.viewport.height) {
                // TODO: resize the grid
                this.updateVisiblity({});
            }
            if (x !== this.props.viewport.x || y !== this.props.viewport.y) {
                // TODO: pan the grid
                this.updateVisiblity({});
            }
        }

        const { toRender } = nextProps.outpost;
        if (toRender.size > 0) {
            toRender.forEach((id: number) => {
                const outpost = nextProps.outpost.idMap.get(id);
                if (outpost.state === DrawableState.SPAWNED) {
                    const ele = new OutpostElement(outpost);
                    const visibility = this.grid.insert(ele);
                    this.updateVisiblity(visibility);
                }
            });
            this.props.render();
        }

        this.animate({});
    }

    render() {
        return null;
    }

    private updateVisiblity(visibility: ElementVisibility) {
        if (visibility.included) {
            visibility.included.forEach((id) => {
                this.activeElements.add(id);

                const e = this.grid.getElement(id) as OutpostElement;
                e.stage.x = e.drawable.x;
                e.stage.y = e.drawable.y;

                this.props.stage.addChild(e.stage);
            });
        }

        if (visibility.excluded) {
            visibility.excluded.forEach((id) => {
                this.activeElements.delete(id);

                const e = this.grid.getElement(id) as OutpostElement;

                this.props.stage.removeChild(e.stage);
            });
        }
    }

    private animate(visibility: ElementVisibility) {
        this.activeElements.forEach((id) => {
            const e = this.grid.getElement(id) as OutpostElement;
            e.animate();
        });
    }
}

interface InnerCircle {
    circle: PIXI.Graphics;
    theta: number;
}

class OutpostElement extends ViewElement {
    private innerCircles: InnerCircle[] = [];

    constructor(outpost: Outpost) {
        super(outpost);
        this.init();
    }

    private init() {
        let circle = new PIXI.Graphics();
        circle.beginFill(this.drawable.color);
        circle.drawCircle(0, 0, 200);
        circle.endFill();
        this.stage.addChild(circle);

        circle = new PIXI.Graphics();
        circle.beginFill(Constants.BACKGROUND_COLOR);
        circle.drawCircle(0, 0, 155);
        circle.endFill();
        this.stage.addChild(circle);

        circle = new PIXI.Graphics();
        circle.beginFill(this.drawable.color);
        circle.drawCircle(0, 0, 70);
        circle.endFill();
        this.stage.addChild(circle);

        for (let i = 0; i < 360; i += 45) {
            circle = new PIXI.Graphics();
            circle.beginFill(this.drawable.color);
            circle.drawCircle(0, 0, 20);
            circle.endFill();
            this.stage.addChild(circle);
            this.innerCircles.push({
                circle,
                theta: i
            });
        }

        this.stage.scale.set(0.10, 0.10);
    }

    animate() {
        this.innerCircles.forEach((c) => {
            c.theta += 4;
            c.circle.x = 110 * Math.cos(c.theta * (Math.PI / 180));
            c.circle.y = 110 * Math.sin(c.theta * (Math.PI / 180));
        });
    }
}

function mapStateToProps(state: StoreRecords) {
    return {
        map: state.map,
        outpost: state.outpost,
        viewport: state.viewport
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        render: bindActionCreators(RenderAction.outposts, dispatch)
    };
}

export default connect<StateProps, DispatchProps, SelfProps>(mapStateToProps, mapDispatchToProps)(OutpostLayer);

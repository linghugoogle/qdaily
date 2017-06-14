import * as React from 'react';
import { connect } from 'react-redux';
import { Router, Scene } from 'react-native-router-flux';
import { AppState } from '../reducers';
import connectComponent from '../utils/connectComponent';
import Home from './Home';
import Dash from './Dash';

const RouterWithRedux = connect()(Router);

interface NavigationProps {
}

interface StateProps {
}

type Props = NavigationProps & StateProps;

class Navigation extends React.Component<NavigationProps, any> {

    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <RouterWithRedux>
                <Scene key="root">
                    <Scene key="home" component={Home} hideNavBar initial={true} />
                    <Scene key="dash" component={Dash} />
                </Scene>
            </RouterWithRedux>
        );
    }
}

function mapStateToProps(state: AppState, ownProps?: NavigationProps): StateProps {
    return {
    };
}

export default connectComponent({
    LayoutComponent: Navigation,
    mapStateToProps: mapStateToProps
});

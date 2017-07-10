import * as React from 'react';
import {
    View, ActivityIndicator, Image, Animated, NativeSyntheticEvent, NativeScrollEvent,
    StyleSheet, ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import FeedList from '../components/FeedList';
import Banners from '../components/Banners';
import HeadLineCard from '../components/HeadLineCard';
import CustomTabBar from '../components/base/CustomTabBar';
import OverlayButton from '../components/base/OverlayButton';
import { AppState } from '../reducers';
import { HomeState } from '../reducers/home';
import { Feed, FeedType, HeadLine } from '../interfaces';
import connectComponent, { ConnectComponentProps } from '../utils/connectComponent';
import SplashScreen from 'react-native-smart-splash-screen';
import { TabViewAnimated } from 'react-native-tab-view';

type HomeContainerProps = NavigationScreenProps<{
}>;

interface StateProps extends HomeState {
}

interface HomeContainerState {
    index: number;
    routes: {
        key: string;
        title: string;
    }[];
    overlayOpacity: Animated.Value;
}

type Props = HomeContainerProps & StateProps & ConnectComponentProps & HomeContainerProps;

const windowWidth = Dimensions.get('window').width;

class HomeContainer extends React.Component<Props, HomeContainerState> {

    private splashClosed = false;
    private lastScrollPosition = 0;
    private overlayVisible = true;
    private scrollStarted = false;

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                { key: 'news', title: 'NEWS' },
                { key: 'labs', title: 'LABS' }
            ],
            overlayOpacity: new Animated.Value(1)
        };
    }

    public componentDidMount() {
        this.refreshNews();
        this.refreshPapers();
    }

    public componentWillReceiveProps(nextProps: Props) {
        if (!this.splashClosed && !nextProps.news_pullRefreshPending) {
            SplashScreen.close({
                animationType: SplashScreen.animationType.fade,
                duration: 500,
                delay: 4000
            });

            this.splashClosed = true;
        }
    }

    private toDetail(feed: Feed) {
        const { navigate } = this.props.navigation;
        if (feed.type === FeedType.PAPER) {
            navigate('paper', { id: feed.post.id });
        } else {
            navigate('article', { id: feed.post.id });
        }
    }

    private toDash() {
        const { navigate } = this.props.navigation;
        navigate('dash');
    }

    private onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
        if (this.scrollStarted) {
            if (e.nativeEvent.contentOffset.y > this.lastScrollPosition) {
                this.hideOverlay();
            } else if (e.nativeEvent.contentOffset.y < this.lastScrollPosition) {
                this.showOverlay();
            }
        }
        this.lastScrollPosition = e.nativeEvent.contentOffset.y;
    }

    private onMomentumScrollBegin() {
        this.scrollStarted = true;
    }

    private onMomentumScrollEnd() {
        this.scrollStarted = false;
        this.showOverlay(1000);
    }

    private showOverlay(delay?: number) {
        if (this.overlayVisible) {
            return;
        }
        this.overlayVisible = true;
        Animated.timing(this.state.overlayOpacity, {
            toValue: 1,
            delay: delay || 50,
            duration: 100
        }).start();
    }

    private hideOverlay() {
        if (!this.overlayVisible) {
            return;
        }
        this.overlayVisible = false;
        Animated.timing(this.state.overlayOpacity, {
            toValue: 0,
            delay: 50,
            duration: 100
        }).start();
    }

    private refreshNews(key?: string) {
        const { actions, news, news_pullRefreshPending } = this.props;
        if (key) {
            if (!news_pullRefreshPending && news.feeds.length) {
                actions.getNews(key);
            }
        } else {
            actions.getNews();
        }
    }

    private refreshPapers(key?: string) {
        const { actions, papers, papers_pullRefreshPending } = this.props;
        if (key) {
            if (!papers_pullRefreshPending && papers.feeds.length) {
                actions.getPapers(key);
            }
        } else {
            actions.getPapers();
        }
    }

    private renderNewsHeader() {
        const { banners, headline = Object.create(null) as HeadLine } = this.props.news;
        return (
            <View>
                <Banners banners={banners} onPress={banner => this.toDetail(banner)} />
                <View style={{ height: 10 }}/>
                <HeadLineCard headline={headline} onPress={() => this.toDetail(headline)} />
                <View style={{ height: 10 }}/>
            </View>
        );
    }

    private renderNewsList() {
        const { news, news_pullRefreshPending } = this.props;
        return (
            <FeedList
                style={{ width: windowWidth }}
                feeds={news.feeds}
                pullRefreshPending={news_pullRefreshPending}
                renderHeader={this.renderNewsHeader.bind(this)}
                onRefresh={this.refreshNews.bind(this)}
                onEndReached={() => this.refreshNews(news.last_key)}
                onItemPress={feed => this.toDetail(feed)}
                onScroll={this.onScroll.bind(this)}
                onMomentumScrollBegin={this.onMomentumScrollBegin.bind(this)}
                onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
            >
            </FeedList>
        );
    }

    private renderLabsList() {
        const { papers, papers_pullRefreshPending } = this.props;
        return (
            <FeedList
                style={{ width: windowWidth }}
                feeds={papers.feeds}
                pullRefreshPending={papers_pullRefreshPending}
                onRefresh={this.refreshNews.bind(this)}
                onEndReached={() => this.refreshPapers(papers.last_key)}
                onItemPress={feed => this.toDetail(feed)}
                onScroll={this.onScroll.bind(this)}
                onMomentumScrollBegin={this.onMomentumScrollBegin.bind(this)}
                onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
            >
            </FeedList>
        );
    }

    private renderScene({ route }) {
        switch (route.key) {
            case 'news':
                return this.renderNewsList();
            case 'labs':
                return this.renderLabsList();
            default:
                return null;
        }
    };

    private renderTabBar(props) {
        return (
            <CustomTabBar
                style={tabBarStyles.container}
                labelStyle={tabBarStyles.label}
                tabStyle={tabBarStyles.tab}
                indicatorStyle={tabBarStyles.indicator}
                {...props} >
            </CustomTabBar>);
    }

    public render(): JSX.Element {
        if (!this.splashClosed) {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size='large' />
                </View>
            );
        }

        const { overlayOpacity, ...state } = this.state;

        return (
            <View style={styles.container}>
                <TabViewAnimated
                    navigationState={state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={this.renderTabBar.bind(this)}
                    onRequestChangeTab={index => this.setState({ index })}
                />
                <OverlayButton onPress={() => this.toDash()}>
                    <Animated.View style={{ opacity: overlayOpacity }}>
                        <Image style={{ width: 50, height: 50 }} source={require('../../res/imgs/icon_round_logo.png')}>
                        </Image>
                    </Animated.View>
                </OverlayButton>
            </View>
        ); 
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        top: Platform.OS === 'android' ? 0 : 20, 
        backgroundColor: '#f2f2f2'
    } as ViewStyle
});

const tabBarStyles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
    } as ViewStyle,
    tab: {
        padding: Platform.OS === 'android' ? 6 : 4,
    } as ViewStyle,
    label: {
        color: '#000'
    } as TextStyle,
    indicator: {
        backgroundColor: '#faca00',
        marginHorizontal: windowWidth / 6,
        height: 3
    } as ViewStyle
});

function mapStateToProps(state: AppState, ownProps?: HomeContainerProps): StateProps {
    return {
        ...state.home
    };
}

export default connectComponent({
    LayoutComponent: HomeContainer,
    mapStateToProps: mapStateToProps
});
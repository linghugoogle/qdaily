import * as React from 'react';
import {
    View, ListView, Image, Text, ListViewDataSource, NativeSyntheticEvent, NativeScrollEvent,
    RefreshControl, ViewStyle
} from 'react-native';
import { Feed } from '../interfaces';
import FeedItem from './FeedItem';

export interface FeedListProp {
    feeds: Feed[];
    hasMore?: boolean;
    style?: ViewStyle;
    pullRefreshPending?: boolean;
    renderHeader?: () => JSX.Element;
    onEndReached?: () => void;
    onRefresh?: () => void;
    onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollEnd?: () => void;
    onMomentumScrollBegin?: () => void;
    onItemPress?: (feed: Feed) => void;
}

export interface FeedListState {
    pageSize: number;
    ds: ListViewDataSource;
}

export default class FeedList extends React.Component<FeedListProp, FeedListState> {

    private list: ListView;

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            pageSize: 28,
            ds: ds.cloneWithRows<Feed[]>(props.feeds)
        };
    }

    private onItemPress(feed: Feed) {
        if (this.props.onItemPress) {
            this.props.onItemPress(feed);
        }
    }

    public componentWillReceiveProps(nextProps: FeedListProp) {
        if (nextProps.feeds !== this.props.feeds) {
            // optimize pageSize
            this.updateData(nextProps.feeds, nextProps.feeds.length - this.props.feeds.length - 1);
        }
    }

    // performance optimization
    public shouldComponentUpdate(nextProps: FeedListProp, nextState: FeedListState) {
        if (this.state !== nextState ||
            this.props.feeds !== nextProps.feeds ||
            this.props.pullRefreshPending !== nextProps.pullRefreshPending
        ) {
            return true;
        } else {
            return false;
        }
    }

    private updateData(data: Feed[], size: number) {
        this.setState({
            ds: this.state.ds.cloneWithRows<Feed[]>(data),
            pageSize: size > 0 ? size : 1
        });
    }

    private renderRow(feed: Feed, sectionID: string, rowID: string) {
        return (
            <View key={rowID} style={{ marginTop: rowID !== '0' ? 10 : 0 }} >
                <FeedItem feed={feed} onPress={() => this.onItemPress(feed)} />
            </View>
        );
    }

    private renderHeader() {
        if (this.props.renderHeader) {
            return this.props.renderHeader();
        }
    }

    private renderFooter() {
        if (!this.props.hasMore) {
            return (
                <View style={{ height: 60, backgroundColor: '#fff', marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>没有更多啦</Text>
                </View>
            );
        }

        if (this.props.feeds.length === 0) {
            return null;
        }
        return (
            <View style={{ height: 120, backgroundColor: '#fff', marginTop: 10, alignItems: 'center' }}>
                <Image style={{ flex: 1 }} source={require('../../res/imgs/icon_loadmore.gif')}></Image>
            </View>
        );
    }

    private onEndReached() {
        if (this.props.onEndReached) {
            this.props.onEndReached();
        }
    }

    private onRefresh() {
        if (this.props.onRefresh) {
            this.props.onRefresh();
        }
    }

    public render() {
        const { pullRefreshPending = false } = this.props;

        return (
            <ListView
                ref={ref => this.list = ref as any}
                style={[{ backgroundColor: '#f2f2f2' }, this.props.style]}
                dataSource={this.state.ds}
                renderRow={this.renderRow.bind(this)}
                renderHeader={this.renderHeader.bind(this)}
                renderFooter={this.renderFooter.bind(this)}
                enableEmptySections
                removeClippedSubviews={true}
                pageSize={this.state.pageSize}
                scrollRenderAheadDistance={2000}
                onEndReachedThreshold={300}
                onEndReached={this.onEndReached.bind(this)}
                onScroll={e => this.props.onScroll && this.props.onScroll(e)}
                onMomentumScrollBegin={() => this.props.onMomentumScrollBegin && this.props.onMomentumScrollBegin()}
                onMomentumScrollEnd={() => this.props.onMomentumScrollEnd && this.props.onMomentumScrollEnd()}
                refreshControl={
                    <RefreshControl
                        refreshing={pullRefreshPending}
                        onRefresh={this.onRefresh.bind(this)}
                    />
                }
            >
            </ListView>
        );
    }
}
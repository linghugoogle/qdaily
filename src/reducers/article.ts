import { Article, ArticleInfo, PromiseMeta, PromiseMetaSequence } from '../interfaces';
import { FSA } from 'flux-standard-action';
import * as types from '../constants/actionTypes';

export interface ArticleState {
    detail: { [id: string]: Article };
    info: { [id: string]: ArticleInfo };
}

const initialState: ArticleState = {
    detail: {},
    info: {}
};

export default function (state = initialState, action: any): ArticleState {
    const { type, payload, error, meta = {} as PromiseMeta } = action as FSA<any, PromiseMeta>;
    const { sequence = {} as PromiseMetaSequence } = meta;
    const pending = sequence.type === 'start';

    switch (type) {
        case types.GET_ARTICLE_DETAIL_BY_ID:
            const article = payload as Article;
            return (!error && !pending) ? {
                ...state,
                detail: {
                    ...state.detail,
                    [article.id]: article
                }
            } : state;
        case types.GET_ARTICLE_INFO_BY_ID:
            const feed = payload as ArticleInfo;
            return (!error && !pending) ? {
                ...state,
                info: {
                    ...state.info,
                    [feed.post.id]: feed
                }
            } : state;
        default:
            return state;
    }
}
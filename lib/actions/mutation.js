import invariant from 'invariant';
import {buildQueryAndVariables} from 'relax-fragments';

import actionTypes from './types';
import request from '../helpers/request';

// Return function for dispatch
// Input options
// {
//   fragments: {
//     updatePage: {
//       _id: 1
//     }
//   },
//   variables: {
//     updatePage: {
//       data: {
//         value: ...,
//         type: 'PageInput!'
//       }
//     }
//   },
//   type: 'REMOVE' || 'UPDATE' || 'ADD'
// }
export default function (options, callback = false) {
  return (dispatch, getState) => {
    invariant(options.fragments, 'Relate: Mutation needs fragments defined');

    const mutation = buildQueryAndVariables(options.fragments, options.variables, 'mutation');
    const {headers, endpoint} = getState().relateReducer;
    return request({
      dispatch,
      type: actionTypes.mutation,
      query: mutation.query,
      variables: mutation.variables,
      fragments: options.fragments,
      mutationType: options.type,
      mutates: options.mutates,
      headers: options.headers || headers,
      endpoint: options.endpoint || endpoint
    }).then((result) => {
      if (callback !== false) {
        callback(result, dispatch);
      }
    });
  };
}

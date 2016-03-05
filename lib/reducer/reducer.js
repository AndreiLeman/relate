import forEach from 'lodash.foreach';
import merge from 'lodash.merge';

import actionTypes from '../actions/types';
import processNode from './process-node';

// Default state
// state will be composed of DB data and connectors data e.g
// {
//   56d0583eb0dc646f07b05cf2: {},
//   568fc7d152e76bc604a74520: {},
//   connector_1: {
//     pages: ['56d0583eb0dc646f07b05cf2', '568fc7d152e76bc604a74520']
//   }
// }
const defaultState = {};

// Connectors might listen to custom graphQL mutations
// e.g
// {
//   connector_1: {
//     pages: {
//       addPage: 'prepend'
//     }
//   }
// }
const connectorsListeners = {};

export default function graphqlReducer (state = defaultState, action = {}) {
  if (action.type === actionTypes.query && action.data && action.fragments) {
    const changes = {};

    forEach(action.fragments, (fragment, queryName) => {
      const result = processNode(action.data[queryName], fragment, queryName); // { relativeNodes: [], nodes: [], changes: {} }
      merge(changes, result.changes);
    });

    return merge({}, state, changes);

    // forEach(action.data, (data, graphAction) => {
    //   let connectorData;
    //
    //   // Add new data
    //   if (data.constructor === Array) { // multiple entries query or mutation
    //     connectorData = [];
    //     forEach(data, (entryData, index) => {
    //       const ID = entryData._id;
    //       Object.assign(changes, {
    //         [ID]: Object.assign({}, state[ID] || {}, changes[ID] || {}, entryData)
    //       });
    //       connectorData.push(ID);
    //     });
    //   } else { // single entry query or mutation
    //     const ID = data._id || graphAction;
    //     if (action.params && action.params.remove) { // TODO: Is this the best way?
    //       Object.assign(changes, {
    //         [ID]: null
    //       });
    //     } else {
    //       Object.assign(changes, {
    //         [ID]: typeof data === 'object' ? Object.assign({}, state[ID] || {}, changes[ID] || {}, data) : data
    //       });
    //     }
    //     connectorData = ID;
    //   }
    //
    //   // Save data map for connectors
    //   const connectors = action.params && action.params.connectors;
    //   if (connectors) {
    //     forEach(connectors, (connectorQuery, connectorId) => {
    //       // check if current graphql action was triggered by the current connector
    //       if (connectorQuery.fragments[graphAction]) {
    //         Object.assign(changes, {
    //           [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //             [graphAction]: connectorData
    //           })
    //         });
    //       }
    //       // Add info to connectorsListeners if appliable
    //       connectorsListeners[connectorId] = connectorQuery.mutations;
    //     });
    //   } else {
    //     // Is a mutation
    //     if (action.params && action.params.remove) {
    //       // remove
    //       const connectorsIds = Object.keys(connectorsListeners);
    //       forEach(connectorsIds, (connectorId) => {
    //         const connectorState = state[connectorId];
    //         forEach(connectorState, (values, query) => {
    //           if (values && values.constructor === Array) {
    //             const index = values.indexOf(connectorData);
    //             if (index !== -1) {
    //               const newConnectorValues = values.slice(0);
    //               newConnectorValues.splice(index, 1);
    //               Object.assign(changes, {
    //                 [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                   [query]: newConnectorValues
    //                 })
    //               });
    //             }
    //           }
    //         });
    //       });
    //     } else {
    //       // add or update
    //       forEach(connectorsListeners, (queries, connectorId) => {
    //         if (queries) {
    //           forEach(queries, (mutations, queryName) => {
    //             if (mutations[graphAction]) {
    //               const connectorMutationAction = mutations[graphAction];
    //               const connectorQueryData = state[connectorId][queryName];
    //               const arrayConnectorData = connectorData.constructor === Array ? connectorData : [connectorData];
    //
    //               if (connectorMutationAction === 'prepend') {
    //                 Object.assign(changes, {
    //                   [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                     [queryName]: [...arrayConnectorData, ...connectorQueryData]
    //                   })
    //                 });
    //               } else if (connectorMutationAction === 'append') {
    //                 Object.assign(changes, {
    //                   [connectorId]: Object.assign({}, state[connectorId] || {}, changes[connectorId] || {}, {
    //                     [queryName]: [...connectorQueryData, ...arrayConnectorData]
    //                   })
    //                 });
    //               }
    //             }
    //           });
    //         }
    //       });
    //     }
    //   }
    // });
    //
    // return Object.assign({}, state, changes);
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    connectorsListeners[action.id] && delete connectorsListeners[action.id];
    // TODO Delete no longer needed data from state?
    return newState;
  }

  return state;
}

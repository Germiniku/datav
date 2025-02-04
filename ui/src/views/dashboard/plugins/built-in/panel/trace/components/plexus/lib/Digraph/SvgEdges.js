// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import SvgEdge from './SvgEdge';
import { isSamePropSetter } from './utils';
export default class SvgEdges extends React.Component {
  shouldComponentUpdate(np) {
    const p = this.props;
    return p.getClassName !== np.getClassName || p.layoutEdges !== np.layoutEdges || p.markerEndId !== np.markerEndId || p.markerStartId !== np.markerStartId || p.renderUtils !== np.renderUtils || !isSamePropSetter(p.setOnEdge, np.setOnEdge);
  }
  render() {
    const {
      getClassName,
      layoutEdges,
      markerEndId,
      markerStartId,
      renderUtils,
      setOnEdge
    } = this.props;
    return layoutEdges.map(edge => /*#__PURE__*/React.createElement(SvgEdge, {
      key: `${edge.edge.from}\v${edge.edge.to}`,
      getClassName: getClassName,
      layoutEdge: edge,
      markerEndId: markerEndId,
      markerStartId: markerStartId,
      renderUtils: renderUtils,
      setOnEdge: setOnEdge
    }));
  }
}
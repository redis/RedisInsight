import React from 'react';

// Mock SVG component for Jest tests
const SvgMock = React.forwardRef((props, ref) => (
  <svg ref={ref} {...props} data-testid="svg-mock" />
));

SvgMock.displayName = 'SvgMock';

export default SvgMock;
export const ReactComponent = SvgMock;

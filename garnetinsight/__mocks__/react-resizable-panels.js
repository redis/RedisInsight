export const Panel = ({ children }) => children;
export const PanelGroup = ({ children }) => children;
export const PanelResizeHandle = () => 'MockPanelResizeHandle';

// Mock utility functions and constants
export const DATA_ATTRIBUTES = {};

export const assert = jest.fn();
export const disableGlobalCursorStyles = jest.fn();
export const enableGlobalCursorStyles = jest.fn();
export const getIntersectingRectangle = jest.fn();
export const getPanelElement = jest.fn();
export const getPanelElementsForGroup = jest.fn();
export const getPanelGroupElement = jest.fn();
export const getResizeHandleElement = jest.fn();
export const getResizeHandleElementIndex = jest.fn();
export const getResizeHandleElementsForGroup = jest.fn();
export const getResizeHandlePanelIds = jest.fn();
export const intersects = jest.fn();
export const setNonce = jest.fn();
export const usePanelGroupContext = jest.fn();

# Vector Sets - Frontend Implementation Plan

## Overview

This document details the frontend implementation for Vector Sets support, including component architecture, Redux state management, and UI patterns.

**Scope**: Redis Insight Desktop and Docker only. Redis 8+ required.

---

## Directory Structure

```
redisinsight/ui/src/
├── constants/
│   └── keys.ts                          # Add VectorSet to KeyTypes enum
├── slices/
│   └── browser/
│       └── vectorset.ts                 # New Redux slice
├── pages/browser/
│   ├── components/
│   │   ├── add-key/
│   │   │   └── constants/
│   │   │       └── key-type-options.ts  # Add VectorSet option
│   │   └── filter-key-type/
│   │       └── constants.ts             # Add VectorSet filter
│   └── modules/
│       └── key-details/
│           └── components/
│               └── vectorset-details/   # NEW: Main component folder
│                   ├── VectorSetDetails.tsx
│                   ├── VectorSetDetails.spec.tsx
│                   ├── VectorSetDetails.styles.ts
│                   ├── index.ts
│                   ├── components/
│                   │   ├── vectorset-header/
│                   │   ├── vectorset-table/
│                   │   ├── vectorset-search/
│                   │   ├── add-vectorset-element/
│                   │   └── edit-element-attributes/
│                   ├── hooks/
│                   │   ├── useVectorSetSearch.ts
│                   │   └── useVectorSetElements.ts
│                   └── utils/
│                       ├── vectorFormatters.ts
│                       └── attributeFilters.ts
└── components/
    └── add-key/
        └── AddVectorSet/                # NEW: Add vector set form
            ├── AddVectorSet.tsx
            ├── AddVectorSet.spec.tsx
            ├── AddVectorSet.styles.ts
            └── index.ts
```

---

## Constants Updates

### KeyTypes Enum

```typescript
// redisinsight/ui/src/constants/keys.ts
export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
  Stream = 'stream',
  VectorSet = 'vectorset', // NEW
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  // ... existing types
  [KeyTypes.VectorSet]: 'Vector Set', // NEW
});
```

### Group Colors

```typescript
// redisinsight/ui/src/constants/key-colors.ts (or wherever colors are defined)
export const GROUP_TYPES_COLORS = Object.freeze({
  // ... existing colors
  [KeyTypes.VectorSet]: '#9B59B6', // Purple - AI/ML associated color
});
```

### API Integration

Vector sets use dedicated API endpoints following the existing Browser module pattern (similar to ZSet, Hash, etc.):

| Endpoint                        | Purpose                           |
| ------------------------------- | --------------------------------- |
| `POST /keys/get-info`           | Get key metadata (via KeysModule) |
| `POST /vector-set`              | Create vector set with element    |
| `POST /vector-set/get-elements` | Get elements for display          |
| `POST /vector-set/search`       | Similarity search (VSIM)          |
| `PUT /vector-set`               | Add/update element                |
| `PATCH /vector-set/attributes`  | Update element attributes         |
| `DELETE /vector-set/elements`   | Remove elements                   |

```typescript
// Example API service
// redisinsight/ui/src/services/vectorset.service.ts
import { apiService } from 'uiSrc/services';

export const getVectorSetElements = async (
  databaseId: string,
  keyName: RedisString,
  count?: number,
) => {
  const response = await apiService.post(
    `databases/${databaseId}/vector-set/get-elements`,
    { keyName, count },
  );
  return response.data;
};
```

---

## Redux State Management

> **Note**: Thunks call dedicated API endpoints (`/vector-set/*`) which handle Redis command execution on the backend.

### State Interface

```typescript
// redisinsight/ui/src/slices/interfaces/vectorset.ts
import { RedisResponseBuffer } from './redis';

export interface VectorSetElement {
  name: RedisResponseBuffer;
  vector: number[];
  attributes?: Record<string, any>;
}

export interface VectorSetSearchResult extends VectorSetElement {
  score: number;
}

export interface VectorSetInfo {
  size: number;
  vectorDim: number;
  quantType: string;
  metadata?: Record<string, any>;
}

export interface StateVectorSet {
  loading: boolean;
  searching: boolean;
  error: string;
  data: {
    total: number;
    key: RedisResponseBuffer | undefined;
    keyName: string;
    elements: VectorSetElement[];
    nextCursor: string;
    info: VectorSetInfo | null;
  };
  search: {
    loading: boolean;
    error: string;
    results: VectorSetSearchResult[];
    query: number[] | null;
  };
  addElement: {
    loading: boolean;
    error: string;
  };
  updateAttributes: {
    loading: boolean;
    error: string;
  };
}
```

### Redux Slice

```typescript
// redisinsight/ui/src/slices/browser/vectorset.ts
import { cloneDeep, remove } from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { KeyTypes } from 'uiSrc/constants';
import { apiService } from 'uiSrc/services';
import {
  bufferToString,
  getApiErrorMessage,
  isEqualBuffers,
} from 'uiSrc/utils';
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry';
import {
  StateVectorSet,
  VectorSetElement,
  VectorSetSearchResult,
  VectorSetInfo,
} from 'uiSrc/slices/interfaces/vectorset';
import successMessages from 'uiSrc/components/notifications/success-messages';
import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys';
import { AppDispatch, RootState } from '../store';
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications';
import { RedisResponseBuffer } from '../interfaces';

export const initialState: StateVectorSet = {
  loading: false,
  searching: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    elements: [],
    nextCursor: '0',
    info: null,
  },
  search: {
    loading: false,
    error: '',
    results: [],
    query: null,
  },
  addElement: {
    loading: false,
    error: '',
  },
  updateAttributes: {
    loading: false,
    error: '',
  },
};

const vectorsetSlice = createSlice({
  name: 'vectorset',
  initialState,
  reducers: {
    setVectorSetInitialState: () => initialState,

    // Load elements
    loadVectorSetElements: (state) => {
      state.loading = true;
      state.error = '';
    },
    loadVectorSetElementsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        keyName: string;
        total: number;
        elements: VectorSetElement[];
        nextCursor?: string;
      }>,
    ) => {
      state.loading = false;
      state.data.keyName = payload.keyName;
      state.data.total = payload.total;
      state.data.elements = payload.elements;
      state.data.nextCursor = payload.nextCursor || '0';
    },
    loadVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },

    // Load more elements
    loadMoreVectorSetElements: (state) => {
      state.loading = true;
    },
    loadMoreVectorSetElementsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        elements: VectorSetElement[];
        nextCursor?: string;
      }>,
    ) => {
      state.loading = false;
      state.data.elements = [...state.data.elements, ...payload.elements];
      state.data.nextCursor = payload.nextCursor || '0';
    },
    loadMoreVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },

    // Load info
    loadVectorSetInfo: (state) => {
      state.loading = true;
    },
    loadVectorSetInfoSuccess: (
      state,
      { payload }: PayloadAction<VectorSetInfo>,
    ) => {
      state.loading = false;
      state.data.info = payload;
    },
    loadVectorSetInfoFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },

    // Search
    searchVectorSet: (state, { payload }: PayloadAction<number[]>) => {
      state.search.loading = true;
      state.search.error = '';
      state.search.query = payload;
      state.searching = true;
    },
    searchVectorSetSuccess: (
      state,
      { payload }: PayloadAction<VectorSetSearchResult[]>,
    ) => {
      state.search.loading = false;
      state.search.results = payload;
    },
    searchVectorSetFailure: (state, { payload }) => {
      state.search.loading = false;
      state.search.error = payload;
    },
    clearSearch: (state) => {
      state.search = initialState.search;
      state.searching = false;
    },

    // Add element
    addVectorSetElement: (state) => {
      state.addElement.loading = true;
      state.addElement.error = '';
    },
    addVectorSetElementSuccess: (state) => {
      state.addElement.loading = false;
    },
    addVectorSetElementFailure: (state, { payload }) => {
      state.addElement.loading = false;
      state.addElement.error = payload;
    },

    // Delete elements (loading state)
    removeVectorSetElements: (state) => {
      state.loading = true;
    },
    removeVectorSetElementsSuccess: (state) => {
      state.loading = false;
    },
    removeVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    removeElementsFromList: (
      state,
      { payload }: PayloadAction<RedisResponseBuffer[]>,
    ) => {
      remove(
        state.data.elements,
        (element) =>
          payload.findIndex((item) => isEqualBuffers(item, element.name)) > -1,
      );
      state.data.total = state.data.total - payload.length;
    },

    // Update attributes
    updateElementAttributes: (state) => {
      state.updateAttributes.loading = true;
      state.updateAttributes.error = '';
    },
    updateElementAttributesSuccess: (state) => {
      state.updateAttributes.loading = false;
    },
    updateElementAttributesFailure: (state, { payload }) => {
      state.updateAttributes.loading = false;
      state.updateAttributes.error = payload;
    },
    updateElementInList: (
      state,
      { payload }: PayloadAction<VectorSetElement>,
    ) => {
      const index = state.data.elements.findIndex((el) =>
        isEqualBuffers(el.name, payload.name),
      );
      if (index > -1) {
        state.data.elements[index] = payload;
      }
    },
  },
});

// Actions
export const {
  setVectorSetInitialState,
  loadVectorSetElements,
  loadVectorSetElementsSuccess,
  loadVectorSetElementsFailure,
  loadMoreVectorSetElements,
  loadMoreVectorSetElementsSuccess,
  loadMoreVectorSetElementsFailure,
  loadVectorSetInfo,
  loadVectorSetInfoSuccess,
  loadVectorSetInfoFailure,
  searchVectorSet,
  searchVectorSetSuccess,
  searchVectorSetFailure,
  clearSearch,
  addVectorSetElement,
  addVectorSetElementSuccess,
  addVectorSetElementFailure,
  removeVectorSetElements,
  removeVectorSetElementsSuccess,
  removeVectorSetElementsFailure,
  removeElementsFromList,
  updateElementAttributes,
  updateElementAttributesSuccess,
  updateElementAttributesFailure,
  updateElementInList,
} = vectorsetSlice.actions;

// Selectors
export const vectorsetSelector = (state: RootState) => state.browser.vectorset;
export const vectorsetDataSelector = (state: RootState) =>
  state.browser.vectorset?.data;
export const vectorsetSearchSelector = (state: RootState) =>
  state.browser.vectorset?.search;
export const vectorsetInfoSelector = (state: RootState) =>
  state.browser.vectorset?.data?.info;

export default vectorsetSlice.reducer;

// Thunks - Call dedicated API endpoints; backend handles Redis commands

export function fetchVectorSetElements(
  key: RedisResponseBuffer,
  count: number = 10,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetElements());

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Call dedicated API endpoint
      const { data } = await apiService.post<GetVectorSetElementsResponse>(
        `databases/${databaseId}/vector-set/get-elements`,
        { keyName: key, count },
      );

      dispatch(
        loadVectorSetElementsSuccess({
          keyName: bufferToString(key),
          total: data.total,
          elements: data.elements,
        }),
      );
      dispatch(updateSelectedKeyRefreshTime(Date.now()));
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(loadVectorSetElementsFailure(errorMessage));
    }
  };
}

export function fetchVectorSetInfo(key: RedisResponseBuffer) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetInfo());

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Use existing keys/get-info endpoint (VectorSetKeyInfoStrategy handles VINFO)
      const { data } = await apiService.post<GetKeyInfoResponse>(
        `databases/${databaseId}/keys/get-info`,
        { keyName: key },
      );

      dispatch(
        loadVectorSetInfoSuccess({
          size: data.length || 0,
          vectorDim: data.vectorDim || 0,
          quantType: data.quantType || 'unknown',
          metadata: data,
        }),
      );
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(loadVectorSetInfoFailure(errorMessage));
    }
  };
}

export function searchVectorSetByVector(
  key: RedisResponseBuffer,
  vector: number[],
  count: number = 10,
  ef: number = 200,
  filter?: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(searchVectorSet(vector));

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Call dedicated search endpoint (backend handles VSIM command)
      const { data } = await apiService.post<SearchVectorSetResponse>(
        `databases/${databaseId}/vector-set/search`,
        {
          keyName: key,
          vector,
          count,
          ef,
          filter,
          withScores: true,
        },
      );

      dispatch(searchVectorSetSuccess(data.results));

      sendEventTelemetry({
        event: TelemetryEvent.BROWSER_VECTORSET_SEARCH,
        eventData: {
          databaseId: stateInit().connections.instances?.connectedInstance?.id,
          resultsCount: results.length,
          hasFilter: !!filter,
        },
      });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(searchVectorSetFailure(errorMessage));
    }
  };
}

export function addVectorSetElements(
  data: {
    keyName: RedisResponseBuffer;
    elements: Array<{
      name: string;
      vector: number[];
      attributes?: Record<string, any>;
    }>;
  },
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addVectorSetElement());

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Call dedicated endpoint (backend handles VADD + VSETATTR)
      await apiService.put(`databases/${databaseId}/vector-set`, {
        keyName: data.keyName,
        elements: data.elements,
      });

      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          stateInit().browser.keys?.viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
        ),
        eventData: {
          databaseId: stateInit().connections.instances?.connectedInstance?.id,
          keyType: KeyTypes.VectorSet,
          numberOfAdded: data.elements.length,
        },
      });
      onSuccessAction?.();
      dispatch(addVectorSetElementSuccess());
      dispatch<any>(fetchKeyInfo(data.keyName));
    } catch (error) {
      onFailAction?.();
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(addVectorSetElementFailure(errorMessage));
    }
  };
}

export function deleteVectorSetElements(
  key: RedisResponseBuffer,
  elements: RedisResponseBuffer[],
  onSuccessAction?: (newTotal: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeVectorSetElements());

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Call dedicated endpoint (backend handles VREM)
      const { data } = await apiService.delete<DeleteVectorSetElementsResponse>(
        `databases/${databaseId}/vector-set/elements`,
        { data: { keyName: key, elements } },
      );

      const newTotalValue = state.browser.vectorset.data.total - data.affected;

      onSuccessAction?.(newTotalValue);
      dispatch(removeVectorSetElementsSuccess());
      dispatch(removeElementsFromList(elements));

      if (newTotalValue > 0) {
        dispatch<any>(refreshKeyInfoAction(key));
        dispatch(
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              key,
              elements.map((el) => bufferToString(el)).join(''),
              'Element',
            ),
          ),
        );
      } else {
        dispatch(deleteSelectedKeySuccess());
        dispatch(deleteKeyFromList(key));
        dispatch(addMessageNotification(successMessages.DELETED_KEY(key)));
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(removeVectorSetElementsFailure(errorMessage));
    }
  };
}

export function updateVectorSetElementAttributes(
  key: RedisResponseBuffer,
  element: RedisResponseBuffer,
  attributes: Record<string, any>,
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateElementAttributes());

    try {
      const state = stateInit();
      const { id: databaseId } = state.connections.connectedInstance;

      // Call dedicated endpoint (backend handles VSETATTR)
      await apiService.patch(`databases/${databaseId}/vector-set/attributes`, {
        keyName: key,
        element,
        attributes,
      });

      onSuccessAction?.();
      dispatch(updateElementAttributesSuccess());
      dispatch<any>(refreshKeyInfoAction(key));
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      dispatch(addErrorNotification(error));
      dispatch(updateElementAttributesFailure(errorMessage));
    }
  };
}

// Helper: Parse VINFO response (key-value pairs)
function parseVInfoResponse(raw: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (let i = 0; i < raw.length; i += 2) {
    result[raw[i]] = raw[i + 1];
  }
  return result;
}

// Helper: Parse VSIM WITHSCORES response
function parseSearchResults(
  raw: string[],
): Array<{ name: string; score: number }> {
  const results = [];
  for (let i = 0; i < raw.length; i += 2) {
    results.push({ name: raw[i], score: parseFloat(raw[i + 1]) });
  }
  return results;
}
```

---

## Components

### VectorSetDetails (Main Component)

```typescript
// pages/browser/modules/key-details/components/vectorset-details/VectorSetDetails.tsx
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { vectorsetSelector, fetchVectorSetElements, fetchVectorSetInfo } from 'uiSrc/slices/browser/vectorset'
import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'

import { VectorSetHeader } from './components/vectorset-header'
import { VectorSetTable } from './components/vectorset-table'
import { VectorSetSearch } from './components/vectorset-search'
import { AddVectorSetElement } from './components/add-vectorset-element'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddItemsAction } from '../key-details-actions'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const VectorSetDetails = (props: Props) => {
  const keyType = KeyTypes.VectorSet
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const dispatch = useDispatch()
  const { loading, data } = useSelector(vectorsetSelector)
  const { name: keyName } = useSelector(selectedKeySelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    if (keyName) {
      dispatch(fetchVectorSetElements(keyName))
      dispatch(fetchVectorSetInfo(keyName))
    }
  }, [keyName])

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (isCancelled) {
      onCloseAddItemPanel()
    }
  }

  const Actions = ({ width }: { width: number }) => (
    <AddItemsAction
      title="Add Elements"
      width={width}
      openAddItemPanel={openAddItemPanel}
    />
  )

  return (
    <Col className="fluid relative" justify="between">
      <KeyDetailsHeader {...props} key="key-details-header" />
      <VectorSetHeader />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />

      <VectorSetSearch
        keyName={keyName}
        onSearchModeChange={setIsSearchMode}
      />

      <FlexItem
        grow
        className="key-details-body"
        key="key-details-body"
        style={{ height: 300 }}
      >
        {!loading && (
          <FlexItem grow style={{ height: '100%' }}>
            <VectorSetTable
              onRemoveKey={onRemoveKey}
              isSearchMode={isSearchMode}
            />
          </FlexItem>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddVectorSetElement closePanel={closeAddItemPanel} />
          </AddKeysContainer>
        )}
      </FlexItem>
    </Col>
  )
}

export { VectorSetDetails }
```

### VectorSetHeader Component

```typescript
// components/vectorset-header/VectorSetHeader.tsx
import React from 'react'
import { useSelector } from 'react-redux'

import { vectorsetInfoSelector } from 'uiSrc/slices/browser/vectorset'
import { Row, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Badge } from 'uiSrc/components/ui'

import * as S from './VectorSetHeader.styles'

const VectorSetHeader = () => {
  const info = useSelector(vectorsetInfoSelector)

  if (!info) return null

  return (
    <S.HeaderContainer>
      <Row gap="l" align="center">
        <FlexItem>
          <Text size="s" color="subdued">Vector Dimension:</Text>
          <Badge>{info.vectorDim}</Badge>
        </FlexItem>
        <FlexItem>
          <Text size="s" color="subdued">Quantization:</Text>
          <Badge>{info.quantType}</Badge>
        </FlexItem>
        <FlexItem>
          <Text size="s" color="subdued">Size:</Text>
          <Badge>{info.size} bytes</Badge>
        </FlexItem>
      </Row>
    </S.HeaderContainer>
  )
}

export { VectorSetHeader }
```

### VectorSetSearch Component

```typescript
// components/vectorset-search/VectorSetSearch.tsx
import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'

import {
  searchVectorSetByVector,
  searchVectorSetByElement,
  clearSearch,
  vectorsetSearchSelector,
  vectorsetInfoSelector,
} from 'uiSrc/slices/browser/vectorset'
import { Row, Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Button, Input, TextArea, ButtonGroup } from 'uiSrc/components/ui'
import { Text } from 'uiSrc/components/base/text'

import { FilterAutoSuggest } from './FilterAutoSuggest'
import * as S from './VectorSetSearch.styles'

type SearchMode = 'element' | 'vector'

interface Props {
  keyName: string
  onSearchModeChange: (isSearching: boolean) => void
}

const VectorSetSearch = ({ keyName, onSearchModeChange }: Props) => {
  const dispatch = useDispatch()
  const { loading, results, query } = useSelector(vectorsetSearchSelector)
  const info = useSelector(vectorsetInfoSelector)

  const [searchMode, setSearchMode] = useState<SearchMode>('element')
  const [elementInput, setElementInput] = useState('')
  const [vectorInput, setVectorInput] = useState('')
  const [count, setCount] = useState(10)
  const [ef, setEf] = useState(200)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')

  const parseVector = (input: string): number[] | null => {
    try {
      const parsed = JSON.parse(`[${input}]`)
      if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === 'number')) {
        return null
      }
      return parsed
    } catch {
      return null
    }
  }

  const handleVectorSearch = useCallback(() => {
    const vector = parseVector(vectorInput)

    if (!vector) {
      setError('Invalid vector format. Enter comma-separated numbers.')
      return
    }

    if (info && vector.length !== info.vectorDim) {
      setError(`Vector must have ${info.vectorDim} dimensions. Got ${vector.length}.`)
      return
    }

    setError('')
    onSearchModeChange(true)
    dispatch(searchVectorSetByVector(keyName, vector, count, ef, filter || undefined))
  }, [vectorInput, count, ef, filter, keyName, info])

  const handleElementSearch = useCallback(() => {
    if (!elementInput.trim()) {
      setError('Enter an element name to search.')
      return
    }

    setError('')
    onSearchModeChange(true)
    dispatch(searchVectorSetByElement(keyName, elementInput.trim()))
  }, [elementInput, keyName])

  const handleSearch = searchMode === 'vector' ? handleVectorSearch : handleElementSearch

  const handleClear = () => {
    setElementInput('')
    setVectorInput('')
    setFilter('')
    setError('')
    onSearchModeChange(false)
    dispatch(clearSearch())
  }

  return (
    <S.SearchContainer>
      <Col gap="m">
        <Row gap="m" align="center">
          <Text weight="bold">Search</Text>
          <ButtonGroup
            options={[
              { id: 'element', label: 'By Element' },
              { id: 'vector', label: 'By Vector' },
            ]}
            selected={searchMode}
            onChange={(id) => setSearchMode(id as SearchMode)}
          />
        </Row>

        {searchMode === 'element' ? (
          <Row gap="m" align="end">
            <FlexItem grow>
              <Input
                label="Element Name"
                placeholder="Enter element name to search..."
                value={elementInput}
                onChange={(e) => setElementInput(e.target.value)}
              />
            </FlexItem>
            <Button onClick={handleSearch} isLoading={loading} fill="solid">
              Search
            </Button>
          </Row>
        ) : (
          <>
            <Row gap="m" align="end">
              <FlexItem grow>
                <TextArea
                  label="Query Vector"
                  placeholder="Enter comma-separated numbers, e.g.: 0.1, 0.2, 0.3, ..."
                  value={vectorInput}
                  onChange={(e) => setVectorInput(e.target.value)}
                  rows={2}
                />
              </FlexItem>

              <FlexItem>
                <Input
                  label="Count"
                  type="number"
                  min={1}
                  max={1000}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </FlexItem>

              <FlexItem>
                <Input
                  label="EF"
                  type="number"
                  min={1}
                  value={ef}
                  onChange={(e) => setEf(Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </FlexItem>
            </Row>

            <Row gap="m" align="end">
              <FlexItem grow>
                <FilterAutoSuggest
                  label="Filter (optional)"
                  placeholder=".rating > 4 and .category == 'electronics'"
                  value={filter}
                  onChange={setFilter}
                  keyName={keyName}
                />
              </FlexItem>

              <Button onClick={handleSearch} isLoading={loading} fill="solid">
                Search
              </Button>
            </Row>
          </>
        )}

        {query && (
          <Button onClick={handleClear} fill="outline" size="s">
            Clear Search
          </Button>
        )}

        {error && (
          <Text color="danger" size="s">{error}</Text>
        )}

        {query && results.length > 0 && (
          <Text size="s" color="subdued">
            Found {results.length} {searchMode === 'vector' ? 'similar vectors' : 'matching elements'}
          </Text>
        )}
      </Col>
    </S.SearchContainer>
  )
}

export { VectorSetSearch }
```

### FilterAutoSuggest Component

```typescript
// components/vectorset-search/FilterAutoSuggest.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { vectorsetDataSelector } from 'uiSrc/slices/browser/vectorset'
import { Input, Popover } from 'uiSrc/components/ui'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import * as S from './FilterAutoSuggest.styles'

interface Props {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  keyName: string
}

const FilterAutoSuggest = ({ label, placeholder, value, onChange, keyName }: Props) => {
  const { elements } = useSelector(vectorsetDataSelector)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [attributeKeys, setAttributeKeys] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Extract unique attribute keys from loaded elements
  useEffect(() => {
    const keys = new Set<string>()
    elements.forEach((el) => {
      if (el.attributes) {
        Object.keys(el.attributes).forEach((key) => keys.add(key))
      }
    })
    setAttributeKeys(Array.from(keys).sort())
  }, [elements])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Show suggestions when user types '.'
    const lastChar = newValue.slice(-1)
    if (lastChar === '.') {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSelectAttribute = (attr: string) => {
    onChange(value + attr)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <S.Container>
      <Input
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
      />

      {showSuggestions && attributeKeys.length > 0 && (
        <S.SuggestionsPopover>
          <Col gap="xs">
            <Text size="xs" color="subdued">Available attributes:</Text>
            {attributeKeys.map((attr) => (
              <S.SuggestionItem
                key={attr}
                onClick={() => handleSelectAttribute(attr)}
              >
                .{attr}
              </S.SuggestionItem>
            ))}
          </Col>
        </S.SuggestionsPopover>
      )}

      <Text size="xs" color="subdued">
        Syntax: .field == "value", .num {'>'} 5, .a and .b, .x in ["a","b"]
      </Text>
    </S.Container>
  )
}

export { FilterAutoSuggest }
```

### VectorSetTable Component

```typescript
// components/vectorset-table/VectorSetTable.tsx
import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  vectorsetDataSelector,
  vectorsetSearchSelector,
  deleteVectorSetElements,
} from 'uiSrc/slices/browser/vectorset'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { Row, Col } from 'uiSrc/components/base/layout/flex'
import { Table, Button, PopoverConfirm } from 'uiSrc/components/ui'
import { Text } from 'uiSrc/components/base/text'
import { bufferToString } from 'uiSrc/utils'

import { VectorDisplay } from './VectorDisplay'
import { AttributesCell } from './AttributesCell'
import * as S from './VectorSetTable.styles'

interface Props {
  onRemoveKey: () => void
  isSearchMode: boolean
}

const VectorSetTable = ({ onRemoveKey, isSearchMode }: Props) => {
  const dispatch = useDispatch()
  const { elements, total } = useSelector(vectorsetDataSelector)
  const { results } = useSelector(vectorsetSearchSelector)
  const { name: keyName, keyName: keyNameString } = useSelector(selectedKeySelector)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const displayData = isSearchMode ? results : elements

  const handleDelete = useCallback((elementName: string) => {
    dispatch(deleteVectorSetElements(
      keyName,
      [elementName],
      (newTotal) => {
        if (newTotal === 0) {
          onRemoveKey()
        }
      },
    ))
    setDeleteConfirmId(null)
  }, [keyName, onRemoveKey])

  // Delete confirmation message per PRD format
  const getDeleteConfirmContent = (elementName: string) => (
    <Col gap="s">
      <Text weight="bold">{elementName}</Text>
      <Text>will be removed from {keyNameString}</Text>
    </Col>
  )

  const columns = [
    {
      id: 'element',
      label: 'Element',
      width: '20%',
      render: (row) => (
        <Text truncate title={bufferToString(row.name)}>
          {bufferToString(row.name)}
        </Text>
      ),
    },
    ...(isSearchMode ? [{
      id: 'score',
      label: 'Score',
      width: '10%',
      render: (row) => (
        <Text>{row.score?.toFixed(4)}</Text>
      ),
    }] : []),
    {
      id: 'vector',
      label: 'Vector',
      width: '35%',
      render: (row) => (
        <VectorDisplay vector={row.vector} maxDisplay={5} />
      ),
    },
    {
      id: 'attributes',
      label: 'Attributes',
      width: '25%',
      render: (row) => (
        <AttributesCell
          keyName={keyName}
          elementName={row.name}
          attributes={row.attributes}
        />
      ),
    },
    {
      id: 'actions',
      label: '',
      width: '10%',
      render: (row) => (
        <Row gap="s" justify="end">
          <PopoverConfirm
            isOpen={deleteConfirmId === bufferToString(row.name)}
            content={getDeleteConfirmContent(bufferToString(row.name))}
            confirmText="Remove"
            onConfirm={() => handleDelete(row.name)}
            onCancel={() => setDeleteConfirmId(null)}
          >
            <Button
              size="s"
              iconType="trash"
              color="danger"
              onClick={() => setDeleteConfirmId(bufferToString(row.name))}
            />
          </PopoverConfirm>
        </Row>
      ),
    },
  ]

  return (
    <S.TableContainer>
      <Table
        columns={columns}
        data={displayData}
        rowKey={(row) => bufferToString(row.name)}
        emptyMessage={isSearchMode ? 'No matching vectors found' : 'No elements in vector set'}
      />

      {!isSearchMode && (
        <S.Footer>
          <Text size="s" color="subdued">
            Showing {elements.length} of {total} elements
          </Text>
        </S.Footer>
      )}
    </S.TableContainer>
  )
}

export { VectorSetTable }
```

### VectorDisplay Component

```typescript
// components/vectorset-table/VectorDisplay.tsx
import React, { useState } from 'react'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Button, Tooltip } from 'uiSrc/components/ui'
import { Text } from 'uiSrc/components/base/text'
import { downloadFile } from 'uiSrc/utils'

import * as S from './VectorDisplay.styles'

interface Props {
  vector: number[]
  elementName?: string
  maxDisplay?: number
}

const VectorDisplay = ({ vector, elementName, maxDisplay = 5 }: Props) => {
  const [expanded, setExpanded] = useState(false)

  const displayVector = expanded ? vector : vector.slice(0, maxDisplay)
  const hasMore = vector.length > maxDisplay

  const formatNumber = (n: number) => n.toFixed(4)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(vector.join(', '))
  }

  const downloadVector = () => {
    const content = vector.join(', ')
    const filename = elementName ? `${elementName}_vector.txt` : 'vector.txt'
    downloadFile(content, filename, 'text/plain')
  }

  return (
    <S.VectorContainer>
      <Row gap="xs" wrap="wrap">
        <Text size="s" color="subdued">[</Text>
        {displayVector.map((n, i) => (
          <S.VectorValue key={i}>
            {formatNumber(n)}
            {i < displayVector.length - 1 && ','}
          </S.VectorValue>
        ))}
        {!expanded && hasMore && (
          <Text size="s" color="subdued">... +{vector.length - maxDisplay} more</Text>
        )}
        <Text size="s" color="subdued">]</Text>
      </Row>

      <Row gap="xs">
        {hasMore && (
          <Button
            size="xs"
            fill="text"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        )}
        <Tooltip content="Copy vector">
          <Button
            size="xs"
            iconType="copy"
            fill="text"
            onClick={copyToClipboard}
          />
        </Tooltip>
        <Tooltip content="Download vector">
          <Button
            size="xs"
            iconType="download"
            fill="text"
            onClick={downloadVector}
          />
        </Tooltip>
      </Row>
    </S.VectorContainer>
  )
}

export { VectorDisplay }
```

---

## Integration Updates

### DynamicTypeDetails

```typescript
// pages/browser/modules/key-details/components/dynamic-type-details/DynamicTypeDetails.tsx
// Add VectorSetDetails to the TypeDetails object:

import { VectorSetDetails } from '../vectorset-details'

const TypeDetails: any = {
  // ... existing types
  [KeyTypes.VectorSet]: <VectorSetDetails {...props} />,  // NEW
}
```

### Filter Key Type Options

```typescript
// pages/browser/components/filter-key-type/constants.ts
// Add Vector Set filter option:

export const FILTER_KEY_TYPE_OPTIONS = [
  // ... existing options
  {
    text: 'Vector Set',
    value: KeyTypes.VectorSet,
    color: GROUP_TYPES_COLORS[KeyTypes.VectorSet],
    minRedisVersion: '8.0.0', // Only show for Redis 8+
  },
];
```

### Add Key Type Options

```typescript
// pages/browser/components/add-key/constants/key-type-options.ts
// Add Vector Set option (Iteration 2):

export const ADD_KEY_TYPE_OPTIONS = [
  // ... existing options
  {
    text: 'Vector Set',
    value: KeyTypes.VectorSet,
    color: GROUP_TYPES_COLORS[KeyTypes.VectorSet],
    minRedisVersion: '8.0.0', // Only show for Redis 8+
  },
];
```

---

## Styled Components

### VectorSetDetails Styles

```typescript
// vectorset-details/VectorSetDetails.styles.ts
import styled from 'styled-components';
import { Col } from 'uiSrc/components/base/layout/flex';

export const Container = styled(Col)`
  height: 100%;
`;
```

### VectorSetHeader Styles

```typescript
// vectorset-header/VectorSetHeader.styles.ts
import styled from 'styled-components';
import { Row } from 'uiSrc/components/base/layout/flex';

export const HeaderContainer = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`;
```

### VectorSetSearch Styles

```typescript
// vectorset-search/VectorSetSearch.styles.ts
import styled from 'styled-components';
import { Col } from 'uiSrc/components/base/layout/flex';

export const SearchContainer = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space300};
  background-color: ${({ theme }) => theme.semantic.color.background.neutral50};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`;
```

---

## Testing Strategy

### Component Tests

Each component should have a corresponding `.spec.tsx` file using the `renderComponent` helper pattern:

```typescript
// VectorSetDetails.spec.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { VectorSetDetails, Props } from './VectorSetDetails'
import { configureStore } from 'uiSrc/slices/store'

const vectorSetElementFactory = Factory.define(() => ({
  name: faker.string.alphanumeric(10),
  vector: Array.from({ length: 128 }, () => faker.number.float({ min: -1, max: 1 })),
  attributes: { category: faker.commerce.department() },
}))

describe('VectorSetDetails', () => {
  const defaultProps: Props = {
    onRemoveKey: jest.fn(),
    onOpenAddItemPanel: jest.fn(),
    onCloseAddItemPanel: jest.fn(),
    onCloseKey: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<Props>, storeState = {}) => {
    const store = configureStore(storeState)
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <Provider store={store}>
        <VectorSetDetails {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render component', () => {
    renderComponent()
    expect(screen.getByText('Vector Similarity Search')).toBeInTheDocument()
  })

  it('should display elements in table', async () => {
    const elements = vectorSetElementFactory.buildList(5)

    renderComponent({}, {
      browser: {
        vectorset: {
          data: {
            elements,
            total: 5,
          },
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText(elements[0].name)).toBeInTheDocument()
    })
  })
})
```

---

## Telemetry Events

```typescript
// Add to telemetry/events.ts
export enum TelemetryEvent {
  // ... existing events

  // Vector Set events
  BROWSER_VECTORSET_SEARCH = 'BROWSER_VECTORSET_SEARCH',
  BROWSER_VECTORSET_ELEMENT_ADDED = 'BROWSER_VECTORSET_ELEMENT_ADDED',
  BROWSER_VECTORSET_ELEMENT_REMOVED = 'BROWSER_VECTORSET_ELEMENT_REMOVED',
  BROWSER_VECTORSET_ATTRIBUTES_UPDATED = 'BROWSER_VECTORSET_ATTRIBUTES_UPDATED',
  BROWSER_VECTORSET_CREATED = 'BROWSER_VECTORSET_CREATED',
}
```

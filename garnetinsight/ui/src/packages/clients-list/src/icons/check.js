function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

import * as React from 'react';

var EuiIconCheck = function EuiIconCheck(_ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, ['title', 'titleId']);

  // For e2e tests. TestCafe is failing for default icons
  try {
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    return /*#__PURE__*/ React.createElement(
      'svg',
      _extends(
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-labelledby': titleId,
        },
        props,
      ),
      title
        ? /*#__PURE__*/ React.createElement(
            'title',
            {
              id: titleId,
            },
            title,
          )
        : null,
      /*#__PURE__*/ React.createElement('path', {
        fillRule: 'evenodd',
        d: 'M6.5 12a.502.502 0 01-.354-.146l-4-4a.502.502 0 01.708-.708L6.5 10.793l6.646-6.647a.502.502 0 01.708.708l-7 7A.502.502 0 016.5 12',
      }),
    );
  } catch (e) {
    return <span>&#10004;</span>;
  }
};

export var icon = EuiIconCheck;

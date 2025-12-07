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

var EuiIconCopy = function EuiIconCopy(_ref) {
  var title = _ref.title,
    titleId = _ref.titleId,
    props = _objectWithoutProperties(_ref, ['title', 'titleId']);

  // For e2e tests. Hammerhead cannot create svg throw createElementNS
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
        d: 'M11.4 0c.235 0 .46.099.622.273l2.743 3c.151.162.235.378.235.602v9.25a.867.867 0 01-.857.875H3.857A.867.867 0 013 13.125V.875C3 .392 3.384 0 3.857 0H11.4zM14 4h-2.6a.4.4 0 01-.4-.4V1H4v12h10V4z',
      }),
      /*#__PURE__*/ React.createElement('path', {
        d: 'M3 1H2a1 1 0 00-1 1v13a1 1 0 001 1h10a1 1 0 001-1v-1h-1v1H2V2h1V1z',
      }),
    );
  } catch (e) {
    return <span>&#8595;</span>;
  }
};

export var icon = EuiIconCopy;

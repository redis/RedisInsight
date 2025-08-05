import * as React from 'react';

function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
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
  const target = _objectWithoutPropertiesLoose(source, excluded);
  let key; let i;
  if (Object.getOwnPropertySymbols) {
    const sourceSymbolKeys = Object.getOwnPropertySymbols(source);
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
  const target = {};
  const sourceKeys = Object.keys(source);
  let key; let i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

const EuiIconArrowDown = function EuiIconArrowDown(_ref) {
  const {title} = _ref;
    const {titleId} = _ref;
    const props = _objectWithoutProperties(_ref, ['title', 'titleId']);

  // For e2e tests. Hammerhead cannot create svg throw createElementNS
  try {
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    return /* #__PURE__ */ React.createElement(
      'svg',
      {
        width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-labelledby': titleId,
        ...props,
      },
      title
        ? /* #__PURE__ */ React.createElement(
            'title',
            {
              id: titleId,
            },
            title,
          )
        : null,
      /* #__PURE__ */ React.createElement('path', {
        fillRule: 'non-zero',
        d: 'M13.069 5.157L8.384 9.768a.546.546 0 01-.768 0L2.93 5.158a.552.552 0 00-.771 0 .53.53 0 000 .759l4.684 4.61c.641.631 1.672.63 2.312 0l4.684-4.61a.53.53 0 000-.76.552.552 0 00-.771 0z',
      }),
    );
  } catch (e) {
    return <span>&#8595;</span>;
  }
};

export var icon = EuiIconArrowDown;

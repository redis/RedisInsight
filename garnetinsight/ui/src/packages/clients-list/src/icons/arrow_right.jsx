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
  let key;
  let i;
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
  let key;
  let i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

const EuiIconArrowRight = function EuiIconArrowRight(_ref) {
  const { title } = _ref;
  const { titleId } = _ref;
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
        fillRule: 'nonzero',
        d: 'M5.157 13.069l4.611-4.685a.546.546 0 000-.768L5.158 2.93a.552.552 0 010-.771.53.53 0 01.759 0l4.61 4.684c.631.641.63 1.672 0 2.312l-4.61 4.684a.53.53 0 01-.76 0 .552.552 0 010-.771z',
      }),
    );
  } catch (e) {
    return <span>&#8594;</span>;
  }
};

export var icon = EuiIconArrowRight;

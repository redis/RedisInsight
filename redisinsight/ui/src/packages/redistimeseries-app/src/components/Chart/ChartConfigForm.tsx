import React, { useState } from 'react'

import { SwitchInput, TextInput } from 'uiSrc/components/base/inputs'
import { FormFieldset } from 'uiSrc/components/base/forms/fieldset'
import { AxisScale, GraphMode, ChartConfigFormProps } from './interfaces'
import {
  X_LABEL_MAX_LENGTH,
  Y_LABEL_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from './constants'
import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import {
  ButtonGroup,
  ButtonGroupProps,
} from 'uiSrc/components/base/forms/button-group/ButtonGroup'

const NewEnumSelect = ({
  selected,
  values,
  onClick,
}: {
  selected: string
  values: string[]
  onClick: (v: string) => void
}) => (
  <div className="new-button">
    {values.map((v) => (
      <div
        title={v.charAt(0).toUpperCase() + v.slice(1)}
        onClick={() => onClick(v)}
        className={`button-point ${selected === v ? 'button-selected' : null}`}
      >
        {v}
      </div>
    ))}
  </div>
)

export default function ChartConfigForm(props: ChartConfigFormProps) {
  const [moreOptions, setMoreOptions] = useState(false)

  const { onChange, value } = props

  const yAxisButtonGroupItems = [
    {
      label: 'Left',
      value: false,
    },
    {
      label: 'Right',
      value: true,
    },
  ]

  return (
    <form className="chart-config-form">
      <div className="chart-form-top">
        <NewEnumSelect
          values={Object.keys(GraphMode)}
          selected={value.mode}
          onClick={(v) => onChange('mode', v)}
        />
        <SwitchInput
          title="Staircase"
          checked={value.staircase}
          onCheckedChange={(checked) => onChange('staircase', checked)}
        />
        <SwitchInput
          title="Fill"
          checked={value.fill}
          onCheckedChange={(checked) => onChange('fill', checked)}
        />
      </div>
      <RiAccordion
        className="chart-form-accordion"
        collapsible
        open={moreOptions}
        onOpenChange={setMoreOptions}
        label={moreOptions ? 'Less options' : 'More options'}
        content={
          <div className="more-options">
            <section>
              <FormFieldset legend={{ children: 'Title' }}>
                <TextInput
                  placeholder="Title"
                  value={value.title}
                  onChange={(value) => onChange('title', value)}
                  aria-label="Title"
                  maxLength={parseInt(TITLE_MAX_LENGTH)}

                />
              </FormFieldset>
              <FormFieldset legend={{ children: 'X axis Label' }}>
                <TextInput
                  placeholder="X axis label"
                  value={value.xlabel}
                  onChange={(value) => onChange('xlabel', value)}
                  aria-label="X Label"
                  maxLength={parseInt(X_LABEL_MAX_LENGTH)}
                />
              </FormFieldset>
            </section>
            <section>
              <div className="right-y-axis">
                <div className="switch-wrapper">
                  <SwitchInput
                    title="Use Right Y Axis"
                    checked={value.yAxis2}
                    onCheckedChange={(checked) => onChange('yAxis2', checked)}
                  />
                </div>
                {value.yAxis2 && (
                  <div className="y-axis-2">
                    {Object.keys(value.keyToY2Axis).map((key) => (
                      <div className="y-axis-2-item">
                        <div>{key}</div>
                        <ButtonGroup>
                          {yAxisButtonGroupItems.map((item) => (
                            <ButtonGroup.Button
                              isSelected={value.keyToY2Axis[key] === item.value}
                              onClick={() =>
                                onChange('keyToY2Axis', {
                                  ...value.keyToY2Axis,
                                  [key]: item.value,
                                })
                              }
                            >
                              {item.label}
                            </ButtonGroup.Button>
                          ))}
                        </ButtonGroup>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <section className="y-axis-config">
              <YAxisConfigForm
                label="Left Y Axis"
                onChange={(v: any) => onChange('yAxisConfig', v)}
                isLeftYAxis={true}
                value={value.yAxisConfig}
              />
              {value.yAxis2 && (
                <YAxisConfigForm
                  label="Right Y Axis"
                  onChange={(v: any) => onChange('yAxis2Config', v)}
                  isLeftYAxis={false}
                  value={value.yAxis2Config}
                />
              )}
            </section>
          </div>
        }
      />
    </form>
  )
}

const YAxisConfigForm = ({ value, onChange, label }: any) => (
  <div>
    <FormFieldset legend={{ children: `${label} Label` }}>
      <TextInput
        placeholder="Label"
        value={value.label}
        onChange={(value) => onChange({ ...value, label: value })}
        aria-label="label"
        maxLength={parseInt(Y_LABEL_MAX_LENGTH)}
      />
    </FormFieldset>
    <FormFieldset legend={{ children: `${label} Scale` }}>
      <EnumSelect
        inputLabel="Scale"
        onChange={(e) =>
          onChange({ ...value, scale: e.target.value as string })
        }
        value={value.scale}
        enumType={AxisScale}
      />
    </FormFieldset>
  </div>
)

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

interface EnumSelectProps {
  enumType: any
  inputLabel: string
  value: string
}
const EnumSelect = ({
  enumType,
  inputLabel,
  ...props
}: EnumSelectProps & ButtonGroupProps) => (
  <ButtonGroup>
    {Object.values(enumType).map((v) => (
      <ButtonGroup.Button
        isSelected={props.value === v}
        key={String(v)}
        onClick={() =>
          props.onChange?.({ target: { value: String(v) } } as any)
        }
      >
        {capitalize(String(v))}
      </ButtonGroup.Button>
    ))}
  </ButtonGroup>
)

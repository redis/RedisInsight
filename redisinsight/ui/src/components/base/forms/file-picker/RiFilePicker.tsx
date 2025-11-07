import React, { InputHTMLAttributes, ReactNode, useRef, useState } from 'react'
import cx from 'classnames'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
import { Loader } from 'uiSrc/components/base/display'
import {
  EmptyButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons'
import {
  FilePickerInput,
  FilePickerPrompt,
  FilePickerPromptText,
  FilePickerWrapper,
} from 'uiSrc/components/base/forms/file-picker/styles'
import { CommonProps } from 'uiSrc/components/base/theme/types'
import ProgressBarLoader from 'uiSrc/components/base/display/progress-bar/ProgressBarLoader'
import { ColorText } from 'uiSrc/components/base/text'

export type RiFilePickerProps = CommonProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    id?: string
    name?: string
    className?: string
    /**
     * The content that appears in the dropzone if no file is attached
     * @default 'Select or drag and drop a file'
     */
    initialPromptText?: ReactNode
    /**
     * Use as a callback to access the HTML FileList API
     */
    onChange?: (files: FileList | null) => void
    /**
     * Size or type of display;
     * `default` for normal height, similar to other controls;
     * `large` for taller size
     * @default large
     */
    display?: 'default' | 'large'
    isInvalid?: boolean
    isLoading?: boolean
    disabled?: boolean
  }

export const RiFilePicker = ({
  initialPromptText = <span>Select or drag and drop a file</span>,
  onChange,
  disabled,
  id,
  name,
  className,
  isInvalid,
  isLoading,
  display,
  ...props
}: RiFilePickerProps) => {
  const [promptText, setPromptText] = useState<string | null>(null)

  const [isHoveringDrop, setIsHoveringDrop] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const generatedId: string = useGenerateId()
  const handleChange = () => {
    if (!fileInput.current) return

    if (fileInput.current.files && fileInput.current.files.length > 1) {
      setPromptText(`${fileInput.current.files.length} files selected`)
    } else if (
      fileInput.current.files &&
      fileInput.current.files.length === 0
    ) {
      setPromptText(null)
    } else {
      setPromptText(fileInput.current.value.split('\\').pop()!)
    }

    onChange?.(fileInput.current.files)
  }
  const removeFiles = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    if (!fileInput.current) return

    fileInput.current.value = ''
    handleChange()
  }

  const showDrop = () => {
    if (!disabled) {
      setIsHoveringDrop(true)
    }
  }

  const hideDrop = () => {
    setIsHoveringDrop(false)
  }

  const promptId = `${id || generatedId}-filePicker__prompt`

  const isOverridingInitialPrompt = promptText != null

  const normalFormControl = display === 'default'

  const classes = cx(
    'RI-File-Picker',
    {
      'RI-File-Picker-isDroppingFile': isHoveringDrop,
      'RI-File-Picker-isInvalid': isInvalid,
      'RI-File-Picker-isLoading': isLoading,
      'RI-File-Picker-hasFiles': isOverridingInitialPrompt,
    },
    className,
  )
  const compressed = display === 'default'

  let clearButton: ReactNode
  if (isLoading && normalFormControl) {
    // Override clear button with loading spinner if it is in loading state
    clearButton = (
      <Loader
        className="RI-File-Picker__loadingSpinner"
        size={compressed ? 's' : 'm'}
      />
    )
  } else if (isOverridingInitialPrompt && !disabled) {
    if (normalFormControl) {
      clearButton = (
        <SecondaryButton
          aria-label="Remove selected files"
          className="RI-File-Picker__clearButton"
          onClick={removeFiles}
          size={compressed ? 's' : 'm'}
        />
      )
    } else {
      clearButton = (
        <EmptyButton
          aria-label="Remove selected files"
          className="RI-File-Picker__clearButton"
          size="small"
          onClick={removeFiles}
        >
          <ColorText color="default">Remove</ColorText>
        </EmptyButton>
      )
    }
  } else {
    clearButton = null
  }

  const loader = !normalFormControl && isLoading && (
    <ProgressBarLoader color="accent" />
  )
  return (
    <FilePickerWrapper className={classes} $large={display === 'large'}>
      <FilePickerInput
        type="file"
        id={id}
        name={name}
        className="RI-File-Picker__input"
        onChange={handleChange}
        ref={fileInput}
        onDragOver={showDrop}
        onDragLeave={hideDrop}
        onDrop={hideDrop}
        disabled={disabled}
        aria-describedby={promptId}
        {...props}
      />
      <FilePickerPrompt
        className="RI-File-Picker__prompt"
        id={promptId}
        $large={display === 'large'}
      >
        <RiIcon
          className="RI-File-Picker__icon"
          color={
            isInvalid ? 'danger500' : disabled ? 'neutral500' : 'primary500'
          }
          type={isInvalid ? 'ToastDangerIcon' : 'UploadIcon'}
          size={normalFormControl ? 'L' : 'XL'}
          aria-hidden="true"
        />
        <FilePickerPromptText size="s" className="RI-File-Picker__promptText">
          {promptText || initialPromptText}
        </FilePickerPromptText>
        {clearButton}
        {loader}
      </FilePickerPrompt>
    </FilePickerWrapper>
  )
}

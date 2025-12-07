import { IFormatter } from './formatter.interfaces'
import MarkdownToJsxString from './MarkdownToJsxString'
import HtmlToJsxString from './HtmlToJsxString'

export enum FileExtension {
  Html = 'html',
  Markdown = 'md',
}

class FormatSelector {
  private static formatters = {
    [FileExtension.Html]: new HtmlToJsxString(),
    [FileExtension.Markdown]: new MarkdownToJsxString(),
  }

  static selectFor(extension: string): IFormatter {
    const FormatterFactory =
      FormatSelector.formatters[extension as FileExtension]
    if (FormatterFactory) {
      return FormatterFactory
    }
    throw new Error('Unsupported format')
  }
}

export default FormatSelector

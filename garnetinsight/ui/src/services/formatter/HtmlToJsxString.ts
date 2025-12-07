import { IFormatter } from './formatter.interfaces'

class HtmlToJsxString implements IFormatter {
  format(data: any): Promise<string> {
    return new Promise((resolve) => {
      resolve(String(data))
    })
  }
}

export default HtmlToJsxString

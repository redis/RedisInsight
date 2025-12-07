export interface IDefaultProps {
  data: any
  space?: number
  gap?: number
  lastElement?: boolean
}

export interface IJsonArrayProps extends IDefaultProps {
  data: Array<any>
}

export interface IJsonObjectProps extends IDefaultProps {
  data: Record<string, any>
}

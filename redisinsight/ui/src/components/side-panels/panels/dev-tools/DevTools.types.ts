export enum InitTargetKind {
  Cloud = 'cloud',
  Url = 'url',
}

export type InitTarget =
  | { kind: InitTargetKind.Cloud; name: string }
  | {
      kind: InitTargetKind.Url
      name: string
      url: string
    }

export interface IVectorSetElementState {
  id: number
  name: string
  vector: string
  attributes: string
  showAttributes: boolean
}

export type VectorKind = 'numeric' | 'fp32'

export interface SubmitElement {
  name: string
  /** Vector embedding as numeric values. Set when the form detected a
   *  `number[]` input. */
  vectorValues?: number[]
  /** Vector embedding as a base64-encoded FP32 little-endian blob. Set when
   *  the form detected a C/Python-style escaped byte string
   *  (e.g. `\x00\x00\x80\x3f...`). */
  vectorFp32?: string
  attributes?: string
}

export interface Props {
  onSubmit: (elements: SubmitElement[]) => void
  onCancel: (isCancelled?: boolean) => void
  loading: boolean
  vectorDim?: number
  submitText?: string
}

export interface VectorFieldInfo {
  text: string
  isError: boolean
}

export interface VectorValidationResult {
  kind?: VectorKind
  numeric?: number[]
  fp32Bytes?: Uint8Array
  dim?: number
  error?: string
}

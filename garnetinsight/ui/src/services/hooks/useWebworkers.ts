import { useState } from 'react'
import { Nullable } from 'uiSrc/utils'

const workerHandler = (fn: (...args: any) => any) => {
  onmessage = (event) => {
    postMessage(fn(event.data))
  }
}

export const useDisposableWebworker = (fn: (...args: any) => any) => {
  const [result, setResult] = useState<Nullable<any>>(null)
  const [error, setError] = useState<Nullable<ErrorEvent>>(null)

  const run = (value: any) => {
    const worker = new Worker(
      URL.createObjectURL(new Blob([`(${workerHandler})(${fn})`])),
    )
    worker.onmessage = (event) => {
      setResult(event.data)
      worker.terminate()
    }
    worker.onerror = (error: ErrorEvent) => {
      setError(error)
      worker.terminate()
    }
    worker.postMessage(value)
  }

  return {
    result,
    error,
    run,
  }
}

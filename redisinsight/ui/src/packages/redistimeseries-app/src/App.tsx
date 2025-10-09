import React from 'react'
import ChartResultView from './components/Chart/ChartResultView'

interface Props {
  command: string
  result?: { response: any; status: string }[]
}

enum TsCmdRangePrefix {
  RANGE = 'TS.RANGE',
  REVRANGE = 'TS.REVRANGE',
}

const App = (props: Props) => {
  const { result: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'fail') {
    return <div className="responseFail">{response}</div>
  }

  if (status === 'success' && typeof response === 'string') {
    return <div className="responseFail">{response}</div>
  }

  function responseParser(command: string, data: any) {
    let [cmd, key] = command.split(' ')

    if (
      [
        TsCmdRangePrefix.RANGE.toString(),
        TsCmdRangePrefix.REVRANGE.toString(),
      ].includes(cmd.toUpperCase())
    ) {
      return [
        {
          key,
          datapoints: data,
        },
      ]
    }

    return data.map((e: any[]) => ({
      key: e[0],
      labels: e[1],
      datapoints: e[2],
    }))
  }

  return (
    <ChartResultView
      data={responseParser(props.command, props.result?.[0].response) as any}
    />
  )
}

export default App

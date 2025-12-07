import { isNull } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import {
  DEFAULT_EXTRAPOLATION,
  SectionName,
  TableView,
} from 'uiSrc/pages/database-analysis/constants'
import TableLoader from 'uiSrc/pages/database-analysis/components/table-loader'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { changeKeyViewType } from 'uiSrc/slices/browser/keys'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { Nullable } from 'uiSrc/utils'
import { TextBtn } from 'uiSrc/pages/database-analysis/components/base/TextBtn'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import TopNamespacesTable from './TopNamespacesTable'
import {
  Section,
  SectionTitle,
  SectionTitleWrapper,
} from 'uiSrc/pages/database-analysis/components/styles'
import {
  NoNamespaceBtn,
  NoNamespaceMsg,
  NoNamespaceText,
  SectionContent,
} from './TopNamespace.styles'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
  extrapolation: number
  onSwitchExtrapolation?: (value: boolean, section: SectionName) => void
}

const TopNamespace = (props: Props) => {
  const { data, loading, extrapolation, onSwitchExtrapolation } = props
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)
  const [isExtrapolated, setIsExtrapolated] = useState<boolean>(true)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    setIsExtrapolated(extrapolation !== DEFAULT_EXTRAPOLATION)
  }, [data, extrapolation])

  const handleTreeViewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    dispatch(resetBrowserTree())
    dispatch(changeKeyViewType(KeyViewType.Tree))
    history.push(Pages.browser(instanceId))
  }

  if (loading) {
    return <TableLoader />
  }

  if (isNull(data)) {
    return null
  }

  if (!data?.topMemoryNsp || data?.totalKeys?.total === 0) {
    return null
  }

  if (!data?.topMemoryNsp?.length && !data?.topKeysNsp?.length) {
    return (
      <Section data-testid="top-namespaces-empty">
        <SectionTitleWrapper>
          <SectionTitle size="M">TOP NAMESPACES</SectionTitle>
        </SectionTitleWrapper>
        <SectionContent data-testid="top-namespaces-message">
          <NoNamespaceMsg>
            <Title size="L">No namespaces to display</Title>
            <NoNamespaceText>
              {'Configure the delimiter in '}
              <NoNamespaceBtn
                data-testid="tree-view-page-link"
                onClick={handleTreeViewClick}
              >
                Tree View
              </NoNamespaceBtn>
              {' to customize the namespaces displayed.'}
            </NoNamespaceText>
          </NoNamespaceMsg>
        </SectionContent>
      </Section>
    )
  }

  return (
    <Section data-testid="top-namespaces">
      <SectionTitleWrapper gap="m">
        <SectionTitle size="M">TOP NAMESPACES</SectionTitle>
        <TextBtn
          $active={tableView === TableView.MEMORY}
          size="small"
          onClick={() => setTableView(TableView.MEMORY)}
          disabled={tableView === TableView.MEMORY}
          data-testid="btn-change-table-memory"
        >
          by Memory
        </TextBtn>
        <TextBtn
          $active={tableView === TableView.KEYS}
          size="small"
          onClick={() => setTableView(TableView.KEYS)}
          disabled={tableView === TableView.KEYS}
          data-testid="btn-change-table-keys"
        >
          by Number of Keys
        </TextBtn>
        {extrapolation !== DEFAULT_EXTRAPOLATION && (
          <SwitchInput
            color="subdued"
            className="switch-extrapolate-results"
            title="Extrapolate results"
            checked={isExtrapolated}
            onCheckedChange={(checked) => {
              setIsExtrapolated(checked)
              onSwitchExtrapolation?.(checked, SectionName.TOP_NAMESPACES)
            }}
            data-testid="extrapolate-results"
          />
        )}
      </SectionTitleWrapper>
      <SectionContent>
        {tableView === TableView.MEMORY && (
          <TopNamespacesTable
            data={data?.topMemoryNsp ?? []}
            defaultSortField="memory"
            delimiter={data?.delimiter ?? ''}
            isExtrapolated={isExtrapolated}
            extrapolation={extrapolation}
            dataTestid="nsp-table-memory"
          />
        )}
        {tableView === TableView.KEYS && (
          <TopNamespacesTable
            data={data?.topKeysNsp ?? []}
            defaultSortField="keys"
            delimiter={data?.delimiter ?? ''}
            isExtrapolated={isExtrapolated}
            extrapolation={extrapolation}
            dataTestid="nsp-table-keys"
          />
        )}
      </SectionContent>
    </Section>
  )
}

export default TopNamespace

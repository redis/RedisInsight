import React, { useEffect, useRef, useState } from 'react'
import { startCase } from 'lodash'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'

import {
  explorePanelSelector,
  resetExplorePanelSearch,
  setExplorePanelContent,
  setExplorePanelSearch,
  setExplorePanelScrollTop,
} from 'uiSrc/slices/panels/sidePanels'
import FormatSelector from 'uiSrc/services/formatter/FormatSelector'
import InternalPage from '../InternalPage'
import {
  getFileInfo,
  getPagesInsideGroup,
  IFileInfo,
} from '../../utils/getFileInfo'

interface IPageData extends IFileInfo {
  content: string
  relatedPages?: IEnablementAreaItem[]
}
const DEFAULT_PAGE_DATA: IPageData = {
  label: '',
  content: '',
  name: '',
  parent: '',
  extension: '',
  location: '',
  relatedPages: [],
  parents: [],
}

export interface Props {
  onClose: () => void
  title?: string
  path: string
  manifest: Nullable<IEnablementAreaItem[]>
  manifestPath?: Nullable<string>
  sourcePath: string
  search: string
}

const LazyInternalPage = ({
  onClose,
  title,
  path,
  sourcePath,
  manifest,
  manifestPath,
  search,
}: Props) => {
  const history = useHistory()
  const {
    itemScrollTop,
    data: contentContext,
    url,
  } = useSelector(explorePanelSelector)
  const { loading: tutorialsLoading } = useSelector(workbenchTutorialsSelector)
  const { loading: customTutorialsLoading } = useSelector(
    workbenchCustomTutorialsSelector,
  )
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [pageData, setPageData] = useState<IPageData>(DEFAULT_PAGE_DATA)
  const dispatch = useDispatch()
  const fetchService = IS_ABSOLUTE_PATH.test(path) ? axios : resourcesService

  const scrollTopRef = useRef(0)

  useEffect(
    () => () => {
      dispatch(setExplorePanelScrollTop(scrollTopRef.current))
    },
    [],
  )

  useEffect(() => {
    const startLoadContent = async () => {
      await loadContent()
    }
    startLoadContent()
  }, [path, sourcePath])

  const isMarkdownLoading =
    isLoading || tutorialsLoading || customTutorialsLoading
  const getRelatedPages = () =>
    manifest ? getPagesInsideGroup(manifest, manifestPath) : []
  const loadContent = async () => {
    setLoading(true)
    setError('')

    const pageInfo = getFileInfo({ manifestPath, path }, manifest)
    const relatedPages = getRelatedPages()
    setPageData({ ...DEFAULT_PAGE_DATA, ...pageInfo, relatedPages })

    try {
      const formatter = FormatSelector.selectFor(pageInfo.extension)
      let content = contentContext

      // if we have already downloaded content we take it from store
      if (url !== path || !contentContext) {
        const { data, status } = await fetchService.get<string>(path)
        if (isStatusSuccessful(status)) {
          content = data
          dispatch(setExplorePanelContent({ data, url: path }))
        }
      }

      dispatch(setExplorePanelSearch(search))
      const contentData = await formatter.format(
        { data: content, path },
        { history },
      )
      setPageData((prevState) => ({ ...prevState, content: contentData }))
      setLoading(false)
    } catch (error) {
      setLoading(false)
      const errorMessage: string = getApiErrorMessage(error as AxiosError)
      dispatch(resetExplorePanelSearch())
      dispatch(setExplorePanelContent({ data: null, url: null }))
      setError(errorMessage)
    }
  }

  const handlePageScroll = (top: number) => {
    scrollTopRef.current = top
  }

  return (
    <InternalPage
      activeKey={pageData._key}
      path={path}
      manifestPath={manifestPath}
      sourcePath={sourcePath}
      onClose={onClose}
      title={startCase(title || pageData.label)}
      backTitle={startCase(pageData?.parent)}
      isLoading={isMarkdownLoading}
      content={pageData.content}
      error={error}
      onScroll={handlePageScroll}
      scrollTop={itemScrollTop}
      pagination={pageData.relatedPages}
    />
  )
}

export default LazyInternalPage

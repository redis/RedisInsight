import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import cx from 'classnames'
import { RiLoadingContent } from 'uiBase/layout'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import {
  EnablementAreaProvider,
  IInternalPage,
} from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import {
  ApiEndpoints,
  EAManifestFirstKey,
  CodeButtonParams,
} from 'uiSrc/constants'
import { findMarkdownPath, Nullable } from 'uiSrc/utils'
import {
  explorePanelSelector,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  setExplorePanelManifest,
} from 'uiSrc/slices/panels/sidePanels'

import { getMarkdownPathByManifest, getWBSourcePath } from './utils/getFileInfo'
import { LazyInternalPage, Navigation } from './components'

import styles from './styles.module.scss'

export interface Props {
  tutorials: IEnablementAreaItem[]
  customTutorials: IEnablementAreaItem[]
  loading: boolean
  openScript: (
    script: string,
    params?: CodeButtonParams,
    onFinish?: () => void,
  ) => void
  onOpenInternalPage: (page: IInternalPage) => void
  isCodeBtnDisabled?: boolean
}

const EnablementArea = (props: Props) => {
  const {
    tutorials = [],
    customTutorials = [],
    openScript,
    loading,
    onOpenInternalPage,
    isCodeBtnDisabled,
  } = props
  const { search } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()
  const {
    manifest,
    search: searchEAContext,
    isPageOpen: isInternalPageVisible,
  } = useSelector(explorePanelSelector)

  const contextManifestPath = new URLSearchParams(searchEAContext).get('path')

  const [internalPage, setInternalPage] = useState<IInternalPage>({
    path: '',
    manifestPath: contextManifestPath,
  })

  const searchRef = useRef<string>('')

  useEffect(() => {
    searchRef.current = search
    const pagePath = new URLSearchParams(search).get('item')

    if (pagePath) {
      dispatch(setExplorePanelIsPageOpen(true))
      setInternalPage({ path: pagePath })
    }
  }, [search])

  useEffect(() => {
    // handle guidePath or tutorialId search params
    const tutorialPathParam = new URLSearchParams(search).get('guidePath') ?? ''
    const tutorialIdParam = new URLSearchParams(search).get('tutorialId') ?? ''
    if (tutorialPathParam || tutorialIdParam) {
      let manifestPath = ''
      const options = tutorialIdParam
        ? { id: tutorialIdParam }
        : { mdPath: tutorialPathParam }
      const tutorialPath = findMarkdownPath(tutorials, options)

      if (tutorialPath) {
        manifestPath = `${EAManifestFirstKey.TUTORIALS}/${tutorialPath}`
      }

      if (manifestPath) {
        handleOpenInternalPage({ path: '', manifestPath }, false)
        return
      }

      dispatch(setExplorePanelIsPageOpen(false))
    }
  }, [search, tutorials])

  useEffect(() => {
    const searchParams = new URLSearchParams(search)

    const guidePath = searchParams.get('guidePath')
    const tutorialId = searchParams.get('tutorialId')
    const itemPath = searchParams.get('item')

    // if we have guidePath or tutorialId another useUffect handle it
    if (guidePath || tutorialId || itemPath) {
      return
    }

    // otherwise we handle path from url or from the context
    const manifestPath = searchParams.get('path')
    if (manifestPath) {
      const { manifest, prefixFolder } = getManifestByPath(manifestPath)
      const path = getMarkdownPathByManifest(
        manifest,
        manifestPath,
        prefixFolder,
      )

      if (path) {
        dispatch(setExplorePanelIsPageOpen(true))
        dispatch(setExplorePanelManifest(manifest))

        setInternalPage({ path, manifestPath })
        return
      }
    }

    if (contextManifestPath) {
      handleOpenInternalPage(
        { path: '', manifestPath: contextManifestPath },
        false,
      )
      return
    }

    dispatch(setExplorePanelIsPageOpen(false))
  }, [search, customTutorials, tutorials])

  const getManifestByPath = (path: Nullable<string> = '') => {
    const manifestPath = path?.replace(/^\//, '') || ''
    if (manifestPath.startsWith(EAManifestFirstKey.CUSTOM_TUTORIALS)) {
      return {
        manifest: customTutorials,
        prefixFolder: ApiEndpoints.CUSTOM_TUTORIALS_PATH,
      }
    }
    if (manifestPath.startsWith(EAManifestFirstKey.TUTORIALS)) {
      return { manifest: tutorials, prefixFolder: ApiEndpoints.TUTORIALS_PATH }
    }

    return { manifest: null }
  }

  const handleOpenInternalPage = (page: IInternalPage, fromUser = true) => {
    setTimeout(() => {
      history.push({
        search: page.manifestPath
          ? `?path=${page.manifestPath}`
          : `?item=${page.path}`,
      })
    }, 0)

    if (fromUser) {
      onOpenInternalPage(page)
    }
  }

  const handleCloseInternalPage = () => {
    dispatch(resetExplorePanelSearch())
    dispatch(setExplorePanelIsPageOpen(false))
    setInternalPage({ path: '' })
    history.push({
      // TODO: better to use query-string parser and update only one parameter (instead of replacing all)
      search: '',
    })
  }

  return (
    <EnablementAreaProvider
      value={{
        setScript: openScript,
        openPage: handleOpenInternalPage,
        isCodeBtnDisabled,
      }}
    >
      <div
        data-testid="enablementArea"
        className={cx(styles.container, 'relative', 'enablement-area')}
      >
        {loading || (isInternalPageVisible && !internalPage?.path) ? (
          <div
            data-testid="enablementArea-loader"
            className={cx(styles.innerContainer, styles.innerContainerLoader)}
          >
            <RiLoadingContent lines={3} />
          </div>
        ) : (
          <Navigation
            tutorials={tutorials}
            customTutorials={customTutorials}
            isInternalPageVisible={isInternalPageVisible}
          />
        )}
        <div
          className={cx({
            [styles.internalPage]: true,
            [styles.internalPageVisible]: isInternalPageVisible,
          })}
        >
          {internalPage?.path && (
            <LazyInternalPage
              onClose={handleCloseInternalPage}
              title={internalPage?.label}
              path={internalPage?.path}
              manifest={manifest}
              manifestPath={internalPage?.manifestPath}
              sourcePath={getWBSourcePath(internalPage?.path)}
              search={searchRef.current}
            />
          )}
        </div>
      </div>
    </EnablementAreaProvider>
  )
}

export default EnablementArea

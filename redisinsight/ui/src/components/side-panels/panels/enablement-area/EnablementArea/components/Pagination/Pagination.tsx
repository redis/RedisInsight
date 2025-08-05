import React, { useContext, useEffect, useState } from 'react'
import cx from 'classnames'
import { isNil } from 'lodash'
import { ChevronLeftIcon, ChevronRightIcon } from 'uiSrc/components/base/icons'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import { Nullable } from 'uiSrc/utils'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import {
  Menu,
  MenuContent,
  MenuDropdownArrow,
  MenuItem,
  MenuTrigger,
} from 'uiSrc/components/base/layout/menu'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  items: IEnablementAreaItem[]
  sourcePath: string
  activePageKey?: Nullable<string>
  compressed?: boolean
}

const Pagination = ({
  items = [],
  sourcePath,
  activePageKey,
  compressed,
}: Props) => {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState(0)
  const { openPage } = useContext(EnablementAreaContext)

  useEffect(() => {
    if (activePageKey) {
      const index = items.findIndex((item) => item._key === activePageKey)
      setActivePage(index)
    }
  }, [activePageKey])

  const toggleMenuOpen = () => {
    setMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleOpenPage = (index: number) => {
    const path = items[index]?.args?.path
    const groupPath = items[index]?._groupPath
    const key = items[index]?._key

    closeMenu()
    if (index !== activePage && openPage && path) {
      openPage({
        path: sourcePath + path,
        manifestPath: !isNil(key) ? `${groupPath}/${key}` : '',
      })
    }
  }

  const PagesControl = () => (
    <Menu open={isMenuOpen}>
      <MenuTrigger>
        <button
          data-testid="enablement-area__toggle-pagination-menu-btn"
          type="button"
          onClick={toggleMenuOpen}
        >
          <Text size="S">
            <strong
              className={styles.underline}
            >{`${activePage + 1} of ${items.length}`}</strong>
          </Text>
        </button>
      </MenuTrigger>
      <MenuContent
        data-testid="enablement-area__pagination-menu"
        placement="top"
        onInteractOutside={() => setMenuOpen(false)}
      >
        {items.map((item, index) => (
          <MenuItem
            data-testid={`menu-item-${index}`}
            key={item.id}
            onClick={() => handleOpenPage(index)}
            text={item.label}
            className={cx({ [styles.activeMenuItem]: activePage === index })}
          />
        ))}
        <MenuDropdownArrow />
      </MenuContent>
    </Menu>
  )

  const size = compressed ? 'small' : 'medium'
  return (
    <div
      className={cx(styles.pagination, {
        [styles.paginationCompressed]: compressed,
      })}
    >
      <div>
        {activePage > 0 && (
          <RiPrimaryButton
            aria-label="Previous page"
            data-testid="enablement-area__prev-page-btn"
            icon={ChevronLeftIcon}
            iconSide="left"
            onClick={() => handleOpenPage(activePage - 1)}
            size={size}
            className={cx(styles.prevPage, {
              [styles.prevPageCompressed]: compressed,
            })}
          >
            Back
          </RiPrimaryButton>
        )}
      </div>
      <div>
        <PagesControl />
      </div>
      <div>
        {activePage < items.length - 1 && (
          <RiPrimaryButton
            aria-label="Next page"
            data-testid="enablement-area__next-page-btn"
            icon={ChevronRightIcon}
            iconSide="right"
            onClick={() => handleOpenPage(activePage + 1)}
            className={cx(styles.nextPage, {
              [styles.nextPageCompressed]: compressed,
            })}
            size={size}
          >
            Next
          </RiPrimaryButton>
        )}
      </div>
    </div>
  )
}

export default Pagination

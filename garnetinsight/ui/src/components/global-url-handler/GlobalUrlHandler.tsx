import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { isNull, isNumber, every, values, pick, some } from 'lodash'
import { Pages } from 'uiSrc/constants'
import { ADD_NEW_CA_CERT, ADD_NEW } from 'uiSrc/pages/home/constants'
import {
  appRedirectionSelector,
  setFromUrl,
  setReturnUrl,
  setUrlDbConnection,
  setUrlHandlingInitialState,
  setUrlProperties,
} from 'uiSrc/slices/app/url-handling'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { autoCreateAndConnectToInstanceAction } from 'uiSrc/slices/instances/instances'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import {
  Nullable,
  transformQueryParamsObject,
  parseRedisUrl,
  Maybe,
} from 'uiSrc/utils'
import { changeSidePanel } from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { setOnboarding } from 'uiSrc/slices/app/features'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { localStorageService } from 'uiSrc/services'
import { AppStorageItem } from 'uiSrc/constants/storage'

const GlobalUrlHandler = () => {
  const { fromUrl } = useSelector(appRedirectionSelector)
  const { isShowConceptsPopup: isShowConsents, config } =
    useSelector(userSettingsSelector)
  const { search } = useLocation()

  const history = useHistory()
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    // start handling only after closing consent popup
    // including updated consents & from scratch
    if (!fromUrl || isNull(isShowConsents) || isShowConsents || !config) return

    try {
      const actionUrl = new URL(fromUrl)
      const fromParams = new URLSearchParams(actionUrl.search)
      const pathname = actionUrl.hostname + actionUrl.pathname
      const action = pathname?.replace(/^(\/\/?)|\/$/g, '')

      // @ts-ignore
      const urlProperties = Object.fromEntries(fromParams) || {}

      // rename cloudBdbId to cloudId
      if (action === UrlHandlingActions.Connect) {
        urlProperties.cloudId = urlProperties.cloudBdbId
        delete urlProperties.cloudBdbId
      }

      dispatch(setUrlProperties(urlProperties))
      dispatch(setFromUrl(null))

      const transformedProperties = transformQueryParamsObject(urlProperties)
      handleCommonProperties(transformedProperties)

      if (action === UrlHandlingActions.Connect)
        connectToDatabase(urlProperties)
      if (action === UrlHandlingActions.Open) openPage(transformedProperties)
    } catch (_e) {
      //
    }
  }, [fromUrl, config, isShowConsents])

  useEffect(() => {
    try {
      const params = new URLSearchParams(search)
      const from = params.get('from')
      const returnUrl = params.get('returnUrl')

      if (from) {
        dispatch(setFromUrl(from))
        history.replace({
          search: '',
        })
      }
      if (returnUrl) {
        localStorageService.set(AppStorageItem.returnUrl, returnUrl)
        dispatch(setReturnUrl(returnUrl))
        history.push(location.pathname)
      }
    } catch {
      // do nothing
    }
  }, [search])

  const redirectToPage = (
    id: Maybe<string>,
    redirectPage: Nullable<string>,
    currentPathname?: string,
  ) => {
    if (redirectPage) {
      const pageToRedirect = getRedirectionPage(
        redirectPage,
        id || undefined,
        currentPathname,
      )

      if (pageToRedirect) {
        history.push(pageToRedirect)
        return
      }
    }

    history.push(id ? Pages.browser(id) : Pages.home)
  }

  const connectToDatabase = (properties: Record<string, any>) => {
    try {
      const {
        redisUrl,
        databaseAlias,
        redirect,
        requiredTls,
        requiredCaCert,
        requiredClientCert,
      } = properties

      const cloudDetails = transformQueryParamsObject(
        pick(properties, [
          'cloudId',
          'subscriptionType',
          'planMemoryLimit',
          'memoryLimitMeasurementUnit',
          'free',
        ]),
      )

      const url = parseRedisUrl(redisUrl)

      if (!url) return

      const obligatoryForAutoConnectFields = {
        host: url.host,
        port: url.port || 6379,
        username: url.username,
        password: url.password,
      }

      const tlsFields = {
        requiredTls,
        requiredCaCert,
        requiredClientCert,
      }

      const isAllObligatoryProvided = every(
        values(obligatoryForAutoConnectFields),
        (value) => value || isNumber(value),
      )
      const isTlsProvided = some(values(tlsFields), (value) => value === 'true')

      const db = {
        ...obligatoryForAutoConnectFields,
        name: databaseAlias || url.hostname || url.host,
      } as any

      if (isAllObligatoryProvided && !isTlsProvided) {
        if (cloudDetails?.cloudId) {
          db.cloudDetails = cloudDetails
        }
        dispatch(setUrlHandlingInitialState())
        dispatch(
          autoCreateAndConnectToInstanceAction(db, (id) =>
            redirectToPage(id, redirect),
          ),
        )

        return
      }

      dispatch(
        setUrlDbConnection({
          action: UrlHandlingActions.Connect,
          dbConnection: {
            ...db,
            // set tls with new cert option
            tls: isTlsProvided,
            caCert:
              requiredCaCert === 'true' ? { id: ADD_NEW_CA_CERT } : undefined,
            clientCert:
              requiredClientCert === 'true' ? { id: ADD_NEW } : undefined,
          },
        }),
      )

      history.push(Pages.home)
    } catch (e) {
      //
    }
  }

  const handleCommonProperties = (properties: Record<string, any>) => {
    if (properties.copilot) {
      dispatch(changeSidePanel(SidePanels.AiAssistant))
    }

    if (properties.onboarding) {
      const totalSteps = Object.keys(ONBOARDING_FEATURES || {}).length
      dispatch(setOnboarding({ currentStep: 0, totalSteps }))
    }
  }

  const openPage = (properties: Record<string, any>) => {
    redirectToPage(undefined, properties.redirect || '/_', location.pathname)
  }

  return null
}

export default GlobalUrlHandler

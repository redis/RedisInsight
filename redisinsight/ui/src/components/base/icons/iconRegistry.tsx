import React from 'react'

// Import all custom SVG assets
import AlarmSvg from 'uiSrc/assets/img/alarm.svg?react'
import BanIconSvg from 'uiSrc/assets/img/monitor/ban.svg?react'
import BulkUploadSvg from 'uiSrc/assets/img/icons/bulk-upload.svg?react'
import ChampagneSvg from 'uiSrc/assets/img/icons/champagne.svg?react'
import CloudLinkSvg from 'uiSrc/assets/img/oauth/cloud_link.svg?react'
import CloudSvg from 'uiSrc/assets/img/oauth/cloud.svg?react'
import ConnectionSvg from 'uiSrc/assets/img/icons/connection.svg?react'
import CopilotSvg from 'uiSrc/assets/img/icons/copilot.svg?react'
import DefaultPluginDarkSvg from 'uiSrc/assets/img/workbench/default_view_dark.svg?react'
import DefaultPluginLightSvg from 'uiSrc/assets/img/workbench/default_view_light.svg?react'
import DislikeSvg from 'uiSrc/assets/img/icons/dislike.svg?react'
import ExtendSvg from 'uiSrc/assets/img/icons/extend.svg?react'
import GithubHelpCenterSVG from 'uiSrc/assets/img/github.svg?react'
import GroupModeSvg from 'uiSrc/assets/img/icons/group_mode.svg?react'
import KeyboardShortcutsSvg from 'uiSrc/assets/img/icons/keyboard-shortcuts.svg?react'
import LikeSvg from 'uiSrc/assets/img/icons/like.svg?react'
import MessageInfoSvg from 'uiSrc/assets/img/icons/help_illus.svg?react'
import MinusInCircleSvg from 'uiSrc/assets/img/icons/minus_in_circle.svg?react'
import NoRecommendationsDarkSvg from 'uiSrc/assets/img/icons/recommendations_dark.svg?react'
import NoRecommendationsLightSvg from 'uiSrc/assets/img/icons/recommendations_light.svg?react'
import NotSubscribedIconDarkSvg from 'uiSrc/assets/img/pub-sub/not-subscribed.svg?react'
import NotSubscribedIconLightSvg from 'uiSrc/assets/img/pub-sub/not-subscribed-lt.svg?react'
import PetardSvg from 'uiSrc/assets/img/icons/petard.svg?react'
import PlayFilledSvg from 'uiSrc/assets/img/icons/play-filled.svg?react'
import PlaySvg from 'uiSrc/assets/img/icons/play.svg?react'
import PlusInCircleSvg from 'uiSrc/assets/img/icons/plus_in_circle.svg?react'
import ProfilerSvg from 'uiSrc/assets/img/icons/profiler.svg?react'
import RawModeSvg from 'uiSrc/assets/img/icons/raw_mode.svg?react'
import RedisDbBlueSvg from 'uiSrc/assets/img/icons/redis_db_blue.svg?react'
import RedisLogoFullSvg from 'uiSrc/assets/img/logo.svg?react'
import RedisLogoSvg from 'uiSrc/assets/img/logo_small.svg?react'
import ResetSvg from 'uiSrc/assets/img/rdi/reset.svg?react'
import ShrinkSvg from 'uiSrc/assets/img/icons/shrink.svg?react'
import SilentModeSvg from 'uiSrc/assets/img/icons/silent_mode.svg?react'
import SnoozeSvg from 'uiSrc/assets/img/icons/snooze.svg?react'
import StarsSvg from 'uiSrc/assets/img/icons/stars.svg?react'
import StopIconSvg from 'uiSrc/assets/img/rdi/stopFilled.svg?react'
import SubscribedIconDarkSvg from 'uiSrc/assets/img/pub-sub/subscribed.svg?react'
import SubscribedIconLightSvg from 'uiSrc/assets/img/pub-sub/subscribed-lt.svg?react'
import SurveySvg from 'uiSrc/assets/img/survey_icon.svg?react'
import TextViewIconDarkSvg from 'uiSrc/assets/img/workbench/text_view_dark.svg?react'
import TextViewIconLightSvg from 'uiSrc/assets/img/workbench/text_view_light.svg?react'
import ThreeDotsSvg from 'uiSrc/assets/img/icons/three_dots.svg?react'
import TriggerIcon from 'uiSrc/assets/img/bulb.svg?react'
import UserInCircleSvg from 'uiSrc/assets/img/icons/user_in_circle.svg?react'
import UserSvg from 'uiSrc/assets/img/icons/user.svg?react'
import VersionSvg from 'uiSrc/assets/img/icons/version.svg?react'
import VisTagCloudSvg from 'uiSrc/assets/img/workbench/vis_tag_cloud.svg?react'
import BikeSvg from 'uiSrc/assets/img/icons/bike.svg?react'
import PopcornSvg from 'uiSrc/assets/img/icons/popcorn.svg?react'

// Import guides icons
import ProbabilisticDataSvg from 'uiSrc/assets/img/guides/probabilistic-data.svg?react'
import JSONSvg from 'uiSrc/assets/img/guides/json.svg?react'
import VectorSimilaritySvg from 'uiSrc/assets/img/guides/vector-similarity.svg?react'

// Import metrics icons
import KeyDarkSvg from 'uiSrc/assets/img/overview/key_dark.svg?react'
import KeyTipSvg from 'uiSrc/assets/img/overview/key_tip.svg?react'
import KeyLightSvg from 'uiSrc/assets/img/overview/key_light.svg?react'
import MemoryDarkSvg from 'uiSrc/assets/img/overview/memory_dark.svg?react'
import MemoryLightSvg from 'uiSrc/assets/img/overview/memory_light.svg?react'
import MemoryTipSvg from 'uiSrc/assets/img/overview/memory_tip.svg?react'
import MeasureLightSvg from 'uiSrc/assets/img/overview/measure_light.svg?react'
import MeasureDarkSvg from 'uiSrc/assets/img/overview/measure_dark.svg?react'
import MeasureTipSvg from 'uiSrc/assets/img/overview/measure_tip.svg?react'
import TimeLightSvg from 'uiSrc/assets/img/overview/time_light.svg?react'
import TimeDarkSvg from 'uiSrc/assets/img/overview/time_dark.svg?react'
import TimeTipSvg from 'uiSrc/assets/img/overview/time_tip.svg?react'
import UserDarkSvg from 'uiSrc/assets/img/overview/user_dark.svg?react'
import UserLightSvg from 'uiSrc/assets/img/overview/user_light.svg?react'
import UserTipSvg from 'uiSrc/assets/img/overview/user_tip.svg?react'
import InputTipSvg from 'uiSrc/assets/img/overview/input_tip.svg?react'
import InputLightSvg from 'uiSrc/assets/img/overview/input_light.svg?react'
import InputDarkSvg from 'uiSrc/assets/img/overview/input_dark.svg?react'
import KeyIconBaseSvg from 'uiSrc/assets/img/overview/key.svg?react'
import MemoryIconBaseSvg from 'uiSrc/assets/img/overview/memory.svg?react'
import MeasureIconBaseSvg from 'uiSrc/assets/img/overview/measure.svg?react'
import TimeIconBaseSvg from 'uiSrc/assets/img/overview/time.svg?react'
import UserIconBaseSvg from 'uiSrc/assets/img/overview/user.svg?react'
import InputIconBaseSvg from 'uiSrc/assets/img/overview/input.svg?react'
import OutputTipSvg from 'uiSrc/assets/img/overview/output_tip.svg?react'
import OutputLightSvg from 'uiSrc/assets/img/overview/output_light.svg?react'
import OutputDarkSvg from 'uiSrc/assets/img/overview/output_dark.svg?react'
import OutputIconBaseSvg from 'uiSrc/assets/img/overview/output.svg?react'

// Import modules icons
import RediStackDarkLogoSvg from 'uiSrc/assets/img/modules/redistack/RedisStackLogoDark.svg?react'
import RediStackDarkMinSvg from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg?react'
import RediStackLightLogoSvg from 'uiSrc/assets/img/modules/redistack/RedisStackLogoLight.svg?react'
import RediStackLightMinLight from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg?react'
import RedisAIDark from 'uiSrc/assets/img/modules/RedisAIDark.svg?react'
import RedisAILight from 'uiSrc/assets/img/modules/RedisAILight.svg?react'
import RedisBloomDark from 'uiSrc/assets/img/modules/RedisBloomDark.svg?react'
import RedisBloomLight from 'uiSrc/assets/img/modules/RedisBloomLight.svg?react'
import RedisGears2Dark from 'uiSrc/assets/img/modules/RedisGears2Dark.svg?react'
import RedisGears2Light from 'uiSrc/assets/img/modules/RedisGears2Light.svg?react'
import RedisGearsDark from 'uiSrc/assets/img/modules/RedisGearsDark.svg?react'
import RedisGearsLight from 'uiSrc/assets/img/modules/RedisGearsLight.svg?react'
import RedisGraphDark from 'uiSrc/assets/img/modules/RedisGraphDark.svg?react'
import RedisGraphLight from 'uiSrc/assets/img/modules/RedisGraphLight.svg?react'
import RedisJSONDark from 'uiSrc/assets/img/modules/RedisJSONDark.svg?react'
import RedisJSONLight from 'uiSrc/assets/img/modules/RedisJSONLight.svg?react'
import RedisSearchDark from 'uiSrc/assets/img/modules/RedisSearchDark.svg?react'
import RedisSearchLight from 'uiSrc/assets/img/modules/RedisSearchLight.svg?react'
import RedisTimeSeriesDark from 'uiSrc/assets/img/modules/RedisTimeSeriesDark.svg?react'
import RedisTimeSeriesLight from 'uiSrc/assets/img/modules/RedisTimeSeriesLight.svg?react'
import UnknownDark from 'uiSrc/assets/img/modules/UnknownDark.svg?react'
import UnknownLight from 'uiSrc/assets/img/modules/UnknownLight.svg?react'
import FormatterSvg from 'uiSrc/assets/img/icons/formatter.svg?react'

// Import options icons
import ActiveActiveDark from 'uiSrc/assets/img/options/Active-ActiveDark.svg?react'
import ActiveActiveLight from 'uiSrc/assets/img/options/Active-ActiveLight.svg?react'
import RedisOnFlashDark from 'uiSrc/assets/img/options/RedisOnFlashDark.svg?react'
import RedisOnFlashLight from 'uiSrc/assets/img/options/RedisOnFlashLight.svg?react'

// Import sidebar icons
import BrowserSvg from 'uiSrc/assets/img/sidebar/browser.svg?react'
import PipelineManagementActiveSvg from 'uiSrc/assets/img/sidebar/pipeline_active.svg?react'
import PipelineManagementSvg from 'uiSrc/assets/img/sidebar/pipeline.svg?react'
import PipelineStatisticsSvg from 'uiSrc/assets/img/sidebar/pipeline_statistics.svg?react'
import PubSubSvg from 'uiSrc/assets/img/sidebar/pubsub.svg?react'
import SlowLogSvg from 'uiSrc/assets/img/sidebar/slowlog.svg?react'
import WorkbenchSvg from 'uiSrc/assets/img/sidebar/workbench.svg?react'

import ShieldSvg from 'uiSrc/assets/img/shield.svg?react'
import RedisSoftwareSvg from 'uiSrc/assets/img/redis-software.svg?react'

import { Icon, IconProps } from './Icon'

// Helper function to create icon component
const createIconComponent =
  (SvgComponent: React.ComponentType<IconProps>) => (props: IconProps) => (
    <Icon icon={SvgComponent} {...props} isSvg />
  )

// Re-export all library icons from @redis-ui/icons
export * from '@redis-ui/icons'

// Export multicolor library icons
export {
  LoaderLargeIcon,
  AzureIcon,
  Awss3Icon,
  GooglecloudIcon,
  GoogleSigninIcon,
  SsoIcon,
  GithubIcon,
  RedisLogoDarkMinIcon,
} from '@redis-ui/icons/multicolor'

// Common icons
export const AlarmIcon = createIconComponent(AlarmSvg)
export const BannedIcon = createIconComponent(BanIconSvg)
export const BulkUploadIcon = createIconComponent(BulkUploadSvg)
export const ChampagneIcon = createIconComponent(ChampagneSvg)
export const CloudIcon = createIconComponent(CloudSvg)
export const CloudLinkIcon = createIconComponent(CloudLinkSvg)
export const ConnectionIcon = createIconComponent(ConnectionSvg)
export const CopilotIcon = createIconComponent(CopilotSvg)
export const DefaultPluginDarkIcon = createIconComponent(DefaultPluginDarkSvg)
export const DefaultPluginLightIcon = createIconComponent(DefaultPluginLightSvg)
export const DislikeIcon = createIconComponent(DislikeSvg)
export const ExtendIcon = createIconComponent(ExtendSvg)
export const GithubHelpCenterIcon = createIconComponent(GithubHelpCenterSVG)
export const GroupModeIcon = createIconComponent(GroupModeSvg)
export const KeyboardShortcutsIcon = createIconComponent(KeyboardShortcutsSvg)
export const LikeIcon = createIconComponent(LikeSvg)
export const MessageInfoIcon = createIconComponent(MessageInfoSvg)
export const MinusInCircleIcon = createIconComponent(MinusInCircleSvg)
export const NoRecommendationsDarkIcon = createIconComponent(
  NoRecommendationsDarkSvg,
)
export const NoRecommendationsLightIcon = createIconComponent(
  NoRecommendationsLightSvg,
)
export const NotSubscribedDarkIcon = createIconComponent(
  NotSubscribedIconDarkSvg,
)
export const NotSubscribedLightIcon = createIconComponent(
  NotSubscribedIconLightSvg,
)
export const PetardIcon = createIconComponent(PetardSvg)
export const PlayFilledIcon = createIconComponent(PlayFilledSvg)
export const PlayIcon = createIconComponent(PlaySvg)
export const PlusInCircleIcon = createIconComponent(PlusInCircleSvg)
export const ProfilerIcon = createIconComponent(ProfilerSvg)
export const RawModeIcon = createIconComponent(RawModeSvg)
export const RedisDbBlueIcon = createIconComponent(RedisDbBlueSvg)
export const RedisLogo = createIconComponent(RedisLogoSvg)
export const RedisLogoFullIcon = createIconComponent(RedisLogoFullSvg)
export const RiResetIcon = createIconComponent(ResetSvg)
export const RiStarsIcon = createIconComponent(StarsSvg)
export const RiStopIcon = createIconComponent(StopIconSvg)
export const RiUserIcon = createIconComponent(UserSvg)
export const ShrinkIcon = createIconComponent(ShrinkSvg)
export const SilentModeIcon = createIconComponent(SilentModeSvg)
export const SnoozeIcon = createIconComponent(SnoozeSvg)
export const SubscribedDarkIcon = createIconComponent(SubscribedIconDarkSvg)
export const SubscribedLightIcon = createIconComponent(SubscribedIconLightSvg)
export const SurveyIcon = createIconComponent(SurveySvg)
export const TextViewIconDarkIcon = createIconComponent(TextViewIconDarkSvg)
export const TextViewIconLightIcon = createIconComponent(TextViewIconLightSvg)
export const ThreeDotsIcon = createIconComponent(ThreeDotsSvg)
export const Trigger = createIconComponent(TriggerIcon)
export const UserInCircle = createIconComponent(UserInCircleSvg)
export const VersionIcon = createIconComponent(VersionSvg)
export const VisTagCloudIcon = createIconComponent(VisTagCloudSvg)
export const BikeIcon = createIconComponent(BikeSvg)
export const PopcornIcon = createIconComponent(PopcornSvg)

// Guides icons
export const ProbabilisticDataIcon = createIconComponent(ProbabilisticDataSvg)
export const JSONIcon = createIconComponent(JSONSvg)
export const VectorSimilarityIcon = createIconComponent(VectorSimilaritySvg)

// Metrics icons
export const KeyDarkIcon = createIconComponent(KeyDarkSvg)
export const KeyTipIcon = createIconComponent(KeyTipSvg)
export const KeyLightIcon = createIconComponent(KeyLightSvg)
export const MemoryDarkIcon = createIconComponent(MemoryDarkSvg)
export const MemoryLightIcon = createIconComponent(MemoryLightSvg)
export const MemoryTipIcon = createIconComponent(MemoryTipSvg)
export const MeasureLightIcon = createIconComponent(MeasureLightSvg)
export const MeasureDarkIcon = createIconComponent(MeasureDarkSvg)
export const MeasureTipIcon = createIconComponent(MeasureTipSvg)
export const TimeLightIcon = createIconComponent(TimeLightSvg)
export const TimeDarkIcon = createIconComponent(TimeDarkSvg)
export const TimeTipIcon = createIconComponent(TimeTipSvg)
export const UserDarkIcon = createIconComponent(UserDarkSvg)
export const UserLightIcon = createIconComponent(UserLightSvg)
export const UserTipIcon = createIconComponent(UserTipSvg)
export const InputTipIcon = createIconComponent(InputTipSvg)
export const InputLightIcon = createIconComponent(InputLightSvg)
export const InputDarkIcon = createIconComponent(InputDarkSvg)
export const KeyIconIcon = createIconComponent(KeyIconBaseSvg)
export const MemoryIconIcon = createIconComponent(MemoryIconBaseSvg)
export const MeasureIconIcon = createIconComponent(MeasureIconBaseSvg)
export const TimeIconIcon = createIconComponent(TimeIconBaseSvg)
export const UserIconIcon = createIconComponent(UserIconBaseSvg)
export const InputIconIcon = createIconComponent(InputIconBaseSvg)
export const OutputTipIcon = createIconComponent(OutputTipSvg)
export const OutputLightIcon = createIconComponent(OutputLightSvg)
export const OutputDarkIcon = createIconComponent(OutputDarkSvg)
export const OutputIconIcon = createIconComponent(OutputIconBaseSvg)

// Modules icons
export const FormatterIcon = createIconComponent(FormatterSvg)
export const RedisAIDarkIcon = createIconComponent(RedisAIDark)
export const RedisAILightIcon = createIconComponent(RedisAILight)
export const RedisBloomDarkIcon = createIconComponent(RedisBloomDark)
export const RedisBloomLightIcon = createIconComponent(RedisBloomLight)
export const RedisGears2DarkIcon = createIconComponent(RedisGears2Dark)
export const RedisGears2LightIcon = createIconComponent(RedisGears2Light)
export const RedisGearsDarkIcon = createIconComponent(RedisGearsDark)
export const RedisGearsLightIcon = createIconComponent(RedisGearsLight)
export const RedisGraphDarkIcon = createIconComponent(RedisGraphDark)
export const RedisGraphLightIcon = createIconComponent(RedisGraphLight)
export const RedisJSONDarkIcon = createIconComponent(RedisJSONDark)
export const RedisJSONLightIcon = createIconComponent(RedisJSONLight)
export const RedisSearchDarkIcon = createIconComponent(RedisSearchDark)
export const RedisSearchLightIcon = createIconComponent(RedisSearchLight)
export const RediStackDarkLogoIcon = createIconComponent(RediStackDarkLogoSvg)
export const RediStackDarkMinIcon = createIconComponent(RediStackDarkMinSvg)
export const RediStackLightLogoIcon = createIconComponent(RediStackLightLogoSvg)
export const RediStackLightMinIcon = createIconComponent(RediStackLightMinLight)
export const RedisTimeSeriesDarkIcon = createIconComponent(RedisTimeSeriesDark)
export const RedisTimeSeriesLightIcon =
  createIconComponent(RedisTimeSeriesLight)
export const UnknownDarkIcon = createIconComponent(UnknownDark)
export const UnknownLightIcon = createIconComponent(UnknownLight)

// Options icons
export const ActiveActiveDarkIcon = createIconComponent(ActiveActiveDark)
export const ActiveActiveLightIcon = createIconComponent(ActiveActiveLight)
export const RedisOnFlashDarkIcon = createIconComponent(RedisOnFlashDark)
export const RedisOnFlashLightIcon = createIconComponent(RedisOnFlashLight)

// Sidebar icons
export const BrowserIcon = createIconComponent(BrowserSvg)
export const PipelineManagementActiveIcon = createIconComponent(
  PipelineManagementActiveSvg,
)
export const PipelineManagementIcon = createIconComponent(PipelineManagementSvg)

export const PipelineStatisticsIcon = createIconComponent(PipelineStatisticsSvg)
export const PubSubIcon = createIconComponent(PubSubSvg)
export const SlowLogIcon = createIconComponent(SlowLogSvg)
export const WorkbenchIcon = createIconComponent(WorkbenchSvg)

export const ShieldIcon = createIconComponent(ShieldSvg)
export const RedisSoftwareIcon = createIconComponent(RedisSoftwareSvg)
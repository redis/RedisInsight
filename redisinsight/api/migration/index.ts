import { initialMigration1614164490968 } from './1614164490968-initial-migration';
import { connectionType1615480887019 } from './1615480887019-connection-type';
import { databaseNameFromProvider1615990079125 } from './1615990079125-database-name-from-provider';
import { removeDatabaseType1615992183565 } from './1615992183565-remove-database-type';
import { ossSentinel1616520395940 } from './1616520395940-oss-sentinel';
import { agreements1625771635418 } from './1625771635418-agreements';
import { serverInfo1626086601057 } from './1626086601057-server-info';
import { databaseHostingProvider1626904405170 } from './1626904405170-database-hosting-provider';
import { settings1627556171227 } from './1627556171227-settings';
import { databaseModules1629729923740 } from './1629729923740-database-modules';
import { databaseDbIndex1634219846022 } from './1634219846022-database-db-index';
import { encryption1634557312500 } from './1634557312500-encryption';
import { commandExecution1641795882696 } from './1641795882696-command-execution';
import { pluginState1641805606399 } from './1641805606399-plugin-state';
import { sni1650278664000 } from './1650278664000-sni';
import { notification1655821010349 } from './1655821010349-notification';
import { notificationCategory1659687030433 } from './1659687030433-notification-category';
import { workbenchMode1660664717573 } from './1660664717573-workbench-mode';
import { workbenchGroupMode1663093411715 } from './1663093411715-workbench-group-mode';
import { databaseAnalysis1664785208236 } from './1664785208236-database-analysis';
import { databaseAnalysisExpirationGroups1664886479051 } from './1664886479051-database-analysis-expiration-groups';
import { workbenchExecutionTime1667368983699 } from './1667368983699-workbench-execution-time';
import { database1667477693934 } from './1667477693934-database';
import { databaseNew1670252337342 } from './1670252337342-database-new';
import { sshOptions1673035852335 } from './1673035852335-ssh-options';
import { workbenchAndAnalysisDbIndex1673934231410 } from './1673934231410-workbench-and-analysis-db';
import { browserHistory1674539211397 } from './1674539211397-browser-history';
import { databaseAnalysisRecommendations1674660306971 } from './1674660306971-database-analysis-recommendations';
import { databaseTimeout1675398140189 } from './1675398140189-database-timeout';
import { databaseCompressor1678182722874 } from './1678182722874-database-compressor';
import { customTutorials1677135091633 } from './1677135091633-custom-tutorials';
import { databaseRecommendations1681900503586 } from './1681900503586-database-recommendations';
import { databaseRecommendationParams1683006064293 } from './1683006064293-database-recommendation-params';
import { Feature1684931530343 } from './1684931530343-feature';
import { DatabaseRedisServer1686719451753 } from './1686719451753-database-redis-server';
import { DatabaseRecommendationUnique1687435940110 } from './1687435940110-database-recommendation-unique';
import { CloudDatabaseDetails1687166457712 } from './1687166457712-cloud-database-details';
import { FreeCloudDatabase1688989337247 } from './1688989337247-freeCloudDatabase';
import { CloudCapiKeys1691061058385 } from './1691061058385-cloud-capi-keys';
import { FeatureSso1691476419592 } from './1691476419592-feature-sso';
import { AiHistory1713515657364 } from './1713515657364-ai-history';
import { AiHistorySteps1714501203616 } from './1714501203616-ai-history-steps';
import { Rdi1716370509836 } from './1716370509836-rdi';
import { AiHistory1718260230164 } from './1718260230164-ai-history';
import { CloudSession1729085495444 } from './1729085495444-cloud-session';
import { CommandExecution1726058563737 } from './1726058563737-command-execution';
import { DatabaseCreatedAt1733740794737 } from './1733740794737-database-createdAt';
import { DbSettings1737362130798 } from './1737362130798-db-settings';
import { DatabaseForceStandalone1738829743482 } from './1738829743482-database-forceStandalone';
import { RdiOptionalAuth1740579711635 } from './1740579711635-rdi-optional-auth';
import { DatabaseTags1741610039177 } from './1741610039177-database-tags';
import { PreSetupDatabases1741786803681 } from './1741786803681-pre-setup-databases';
import { KeyNameFormatAdded1742303245547 } from './1742303245547-key-name-format';
import { CascadeTags1743432519891 } from './1743432519891-cascade-tags';
import { EncryptTags1743606395647 } from './1743606395647-encrypt-tags';
import { UpdateProviderNames1755086732238 } from './1755086732238-update-provider-names';
import { CertificateFilePaths1769500000000 } from './1769500000000-certificate-file-paths';

export default [
  initialMigration1614164490968,
  connectionType1615480887019,
  databaseNameFromProvider1615990079125,
  removeDatabaseType1615992183565,
  ossSentinel1616520395940,
  agreements1625771635418,
  serverInfo1626086601057,
  databaseHostingProvider1626904405170,
  settings1627556171227,
  databaseModules1629729923740,
  databaseDbIndex1634219846022,
  encryption1634557312500,
  commandExecution1641795882696,
  pluginState1641805606399,
  sni1650278664000,
  notification1655821010349,
  notificationCategory1659687030433,
  workbenchMode1660664717573,
  workbenchGroupMode1663093411715,
  databaseAnalysis1664785208236,
  databaseAnalysisExpirationGroups1664886479051,
  workbenchExecutionTime1667368983699,
  database1667477693934,
  databaseNew1670252337342,
  sshOptions1673035852335,
  workbenchAndAnalysisDbIndex1673934231410,
  databaseAnalysisRecommendations1674660306971,
  browserHistory1674539211397,
  databaseTimeout1675398140189,
  databaseCompressor1678182722874,
  customTutorials1677135091633,
  databaseRecommendations1681900503586,
  databaseRecommendationParams1683006064293,
  Feature1684931530343,
  DatabaseRedisServer1686719451753,
  DatabaseRecommendationUnique1687435940110,
  CloudDatabaseDetails1687166457712,
  FreeCloudDatabase1688989337247,
  CloudCapiKeys1691061058385,
  FeatureSso1691476419592,
  AiHistory1713515657364,
  AiHistorySteps1714501203616,
  Rdi1716370509836,
  AiHistory1718260230164,
  CloudSession1729085495444,
  CommandExecution1726058563737,
  DatabaseCreatedAt1733740794737,
  DbSettings1737362130798,
  DatabaseForceStandalone1738829743482,
  RdiOptionalAuth1740579711635,
  DatabaseTags1741610039177,
  PreSetupDatabases1741786803681,
  KeyNameFormatAdded1742303245547,
  CascadeTags1743432519891,
  EncryptTags1743606395647,
  UpdateProviderNames1755086732238,
  CertificateFilePaths1769500000000,
];

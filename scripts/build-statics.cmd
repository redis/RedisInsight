@echo off

:: =============== Plugins ===============
set PLUGINS_DIR=".\garnetinsight\api\static\plugins"
set PLUGINS_VENDOR_DIR=".\garnetinsight\api\static\resources\plugins"

:: Default plugins assets
call sass ".\garnetinsight\ui\src\styles\main_plugin.scss" ".\vendor\global_styles.css" --style=compressed --no-source-map
call sass ".\garnetinsight\ui\src\styles\themes\dark_theme\darkTheme.scss" ".\vendor\dark_theme.css" --style=compressed --no-source-map
call sass ".\garnetinsight\ui\src\styles\themes\light_theme\lightTheme.scss" ".\vendor\light_theme.css" --style=compressed --no-source-map
xcopy ".\garnetinsight\ui\src\assets\fonts\graphik" ".\vendor\fonts\" /s /e /y
xcopy ".\garnetinsight\ui\src\assets\fonts\inconsolata" ".\vendor\fonts\" /s /e /y
if not exist %PLUGINS_VENDOR_DIR% mkdir %PLUGINS_VENDOR_DIR%
xcopy ".\vendor\." "%PLUGINS_VENDOR_DIR%" /s /e /y

:: Install developing tools for plugins
set PACKAGES_DIR=".\garnetinsight\ui\src\packages"
call yarn --cwd "%PACKAGES_DIR%"

:: Install plugins dependencies
set REDISEARCH_DIR=".\garnetinsight\ui\src\packages\redisearch"
call yarn --cwd "%REDISEARCH_DIR%"

set REDISGRAPH_DIR=".\garnetinsight\ui\src\packages\redisgraph"
call yarn --cwd "%REDISGRAPH_DIR%"

set REDISTIMESERSIES_DIR=".\garnetinsight\ui\src\packages\redistimeseries-app"
call yarn --cwd "%REDISTIMESERSIES_DIR%"

set RI_EXPLIAIN_DIR=".\garnetinsight\ui\src\packages\ri-explain"
call yarn --cwd "%RI_EXPLIAIN_DIR%"

set CLIENTS_LIST_DIR=".\garnetinsight\ui\src\packages\clients-list"
call yarn --cwd "%CLIENTS_LIST_DIR%"

::  Build all plugins and common libraries
call yarn --cwd "%PACKAGES_DIR%" build

:: Copy common libraries to plugins
set COMMON_DIR=".\garnetinsight\ui\src\packages\common"
if not exist "%PLUGINS_DIR%\common" mkdir "%PLUGINS_DIR%\common"
xcopy /E /Y "%COMMON_DIR%\index*.js" "%PLUGINS_DIR%\common"
copy "%COMMON_DIR%\package.json" "%PLUGINS_DIR%\common\"


:: Copy redisearch plugin
if not exist "%PLUGINS_DIR%\redisearch" mkdir "%PLUGINS_DIR%\redisearch"
if not exist "%PLUGINS_DIR%\redisearch\dist" mkdir "%PLUGINS_DIR%\redisearch\dist"
xcopy "%REDISEARCH_DIR%\dist" "%PLUGINS_DIR%\redisearch\dist\" /s /e /y
copy "%REDISEARCH_DIR%\package.json" "%PLUGINS_DIR%\redisearch\"

:: Copy redisgraph plugin
if not exist "%PLUGINS_DIR%\redisgraph" mkdir "%PLUGINS_DIR%\redisgraph"
if not exist "%PLUGINS_DIR%\redisgraph\dist" mkdir "%PLUGINS_DIR%\redisgraph\dist"
xcopy "%REDISGRAPH_DIR%\dist" "%PLUGINS_DIR%\redisgraph\dist\" /s /e /y
copy "%REDISGRAPH_DIR%\package.json" "%PLUGINS_DIR%\redisgraph\"

:: Copy redistimeseries plugin
if not exist "%PLUGINS_DIR%\redistimeseries-app" mkdir "%PLUGINS_DIR%\redistimeseries-app"
if not exist "%PLUGINS_DIR%\redistimeseries-app\dist" mkdir "%PLUGINS_DIR%\redistimeseries-app\dist"
xcopy "%REDISTIMESERSIES_DIR%\dist" "%PLUGINS_DIR%\redistimeseries-app\dist\" /s /e /y
copy "%REDISTIMESERSIES_DIR%\package.json" "%PLUGINS_DIR%\redistimeseries-app\"

:: Copy ri-explain plugin
if not exist "%PLUGINS_DIR%\ri-explain" mkdir "%PLUGINS_DIR%\ri-explain"
if not exist "%PLUGINS_DIR%\ri-explain\dist" mkdir "%PLUGINS_DIR%\ri-explain\dist"
xcopy "%RI_EXPLIAIN_DIR%\dist" "%PLUGINS_DIR%\ri-explain\dist\" /s /e /y
copy "%RI_EXPLIAIN_DIR%\package.json" "%PLUGINS_DIR%\ri-explain\"

:: Copy clients-list and json plugin
if not exist "%PLUGINS_DIR%\clients-list" mkdir "%PLUGINS_DIR%\clients-list"
if not exist "%PLUGINS_DIR%\clients-list\dist" mkdir "%PLUGINS_DIR%\clients-list\dist"
xcopy "%CLIENTS_LIST_DIR%\dist" "%PLUGINS_DIR%\clients-list\dist\" /s /e /y
copy "%CLIENTS_LIST_DIR%\package.json" "%PLUGINS_DIR%\clients-list\"

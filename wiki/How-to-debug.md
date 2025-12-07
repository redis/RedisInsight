If you have any issues occurring in Redis Insight, you can follow the steps below to get more information about the errors and find their root cause.
## Connection issues
If you experience connection issues, try these steps.
### I. Launch Redis Insight in debug mode
Run the following command to launch Redis Insight in debug mode to investigate connection issues:
1. Windows OS:
`cmd /C “set DEBUG=ioredis* && ".\Redis Insight.exe"”`
2. MacOS (from the `/Applications` folder):
`DEBUG=ioredis* open "Redis Insight.app"`
3. Linux OS:
`DEBUG=ioredis* "redis insight"`
### II. Investigate logs

Open logs to investigate errors. Usually, they are located here:

`users/local_user/.redis-insight`

## Other issues
### I. To debug issues, other than connectivity ones:
1. Windows OS:
`cmd /C “set DEBUG=* && ".\Redis Insight.exe"”`
2. MacOS (from the `/Applications` folder):
`DEBUG=* open "Redis Insight.app"`
3. Linux OS:
`DEBUG=* "redis insight"`
### II. Get detailed Redis Insight logs
1. Windows OS:
`cmd /C “set STDOUT_LOGGER=true && set LOG_LEVEL=debug && set LOGGER_OMIT_DATA=false && ".\Redis Insight.exe"”`
2. MacOS (from the `/Applications` folder):
`LOG_LEVEL=debug LOGGER_OMIT_DATA=false open "Redis Insight.app"`
3. Linux OS:
`LOG_LEVEL=debug LOGGER_OMIT_DATA=false "redis insight"`
**NOTE:** if you use `LOGGER_OMIT_DATA=false`, logs may contain sensitive data.
### III. To log everything
1. Windows OS:
`cmd /C “set STDOUT_LOGGER=true && set LOG_LEVEL=debug && set LOGGER_OMIT_DATA=false && set DEBUG=* && ".\Redis Insight.exe"”`
2. MacOS (from the `/Applications` folder):
`LOG_LEVEL=debug LOGGER_OMIT_DATA=false DEBUG=* open "Redis Insight.app"`
3. Linux OS:
`LOG_LEVEL=debug LOGGER_OMIT_DATA=false DEBUG=* "redis insight"`
**NOTE:** if you use `LOGGER_OMIT_DATA=false` or `DEBUG=*`, logs may contain sensitive data.
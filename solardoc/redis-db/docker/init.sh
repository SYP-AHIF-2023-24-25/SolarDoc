# The following line is a fix for the following error:
#
# WARNING overcommit_memory is set to 0! Background save may fail under low memory condition.
# To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot
# or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
# The overcommit_memory has 3 options.
# 0, the system kernel check if there is enough memory to be allocated to the process or not,
# if not enough, it will return errors to the process.
# 1, the system kernel is allowed to allocate the whole memory to the process
# no matter what the status of memory is.
# 2, the system kernel is allowed to allocate a memory whose size could be bigger than
# the sum of the size of physical memory and the size of exchange workspace to the process.
echo "[init.sh] Setting overcommit_memory to 1 to avoid OOE errors..."
sysctl vm.overcommit_memory=1 >/dev/null

# Ensure 'REDIS_ROOT_PASSWORD' is set
if [ -z "$REDIS_ROOT_PASSWORD" ]; then
  echo "[init.sh] 'REDIS_ROOT_PASSWORD' is not set. Exiting..."
  exit 1
fi

USERS_ACL=/usr/local/etc/redis/users.acl

# Create 'users.acl' file if it doesn't exist
if [ ! -f $USERS_ACL ]; then
  echo "[init.sh] 'users.acl' file doesn't exist. Creating..."
  touch $USERS_ACL
fi

add_redis_user() {
  # Check if user already exists
  if grep -q "user $REDIS_USERNAME" $USERS_ACL; then
    echo "[init.sh] User '$REDIS_USERNAME' already exists. Skipping..."
  else
    # Add user to 'users.acl'
    echo "[init.sh] Adding user '$REDIS_USERNAME' to 'users.acl'..."
    echo "user $REDIS_USERNAME on ~* &* +@all -@dangerous +info >$REDIS_PASSWORD" >> $USERS_ACL
  fi
}

add_redis_default() {
  # Check if default user already exists
  if grep -q "user default" $USERS_ACL; then
    echo "[init.sh] User 'default' already exists. Skipping..."
  else
    # Add default user to 'users.acl'
    echo "[init.sh] Adding 'default' user to 'users.acl'..."
    echo "user default on ~* &* +@all >$REDIS_ROOT_PASSWORD" >> $USERS_ACL
  fi
}

# Add 'default' user if it doesn't exist
echo "[init.sh] Adding 'default' user to 'users.acl'..."
add_redis_default

# Add user if 'REDIS_USERNAME' and 'REDIS_PASSWORD' are set
if [ -n "$REDIS_USERNAME" ] && [ -n "$REDIS_PASSWORD" ]; then
  add_redis_user
else
  echo "[init.sh] 'REDIS_USERNAME' and 'REDIS_PASSWORD' are not set. Please use 'REDIS_ROOT_PASSWORD' to log in."
fi

# Starting Redis Stack (Copied from https://github.com/redis-stack/redis-stack/blob/6b4a316f06965e41b248d238f84862f5c3027061/etc/scripts/entrypoint.sh)
BASEDIR=/opt/redis-stack
cd ${BASEDIR}

CMD=${BASEDIR}/bin/redis-server
CONF_FILE=/usr/local/etc/redis/redis.conf

# When running in redis-stack (as opposed to redis-stack-server)
if [ -f ${BASEDIR}/nodejs/bin/node ]; then
    ${BASEDIR}/nodejs/bin/node -r ${BASEDIR}/share/redisinsight/api/node_modules/dotenv/config share/redisinsight/api/dist/src/main.js dotenv_config_path=${BASEDIR}/share/redisinsight/.env &
fi

if [ -z ${REDISEARCH_ARGS} ]; then
  REDISEARCH_ARGS="MAXSEARCHRESULTS 10000 MAXAGGREGATERESULTS 10000"
fi

if [ -z ${REDISGRAPH_ARGS} ]; then
  REDISGRAPH_ARGS="MAX_QUEUED_QUERIES 25 TIMEOUT 1000 RESULTSET_SIZE 10000"
fi

echo "[init.sh] Starting redis server..."

ls -l /opt/redis-stack/lib

${CMD} \
${CONF_FILE} \
--protected-mode no \
--daemonize no \
--loadmodule /opt/redis-stack/lib/redisearch.so ${REDISEARCH_ARGS} \
--loadmodule /opt/redis-stack/lib/redistimeseries.so ${REDISTIMESERIES_ARGS} \
--loadmodule /opt/redis-stack/lib/rejson.so ${REDISJSON_ARGS} \
--loadmodule /opt/redis-stack/lib/redisbloom.so ${REDISBLOOM_ARGS} \
--loadmodule /opt/redis-stack/lib/redisgears.so v8-plugin-path /opt/redis-stack/lib/libredisgears_v8_plugin.so ${REDISGEARS_ARGS} \
${REDIS_ARGS}

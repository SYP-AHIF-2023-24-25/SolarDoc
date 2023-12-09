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

add_redis_user() {
  # Wait for redis server to start
  echo "[init.sh] Waiting for redis server to start..."
  sleep 8

  # Add user to redis to allow remote access
  echo "[init.sh] Adding user '$REDIS_USERNAME' to redis..."
  echo -e "
  AUTH $REDIS_ROOT_PASSWORD
  ACL SETUSER $REDIS_USERNAME on ~* &* +@all -@dangerous +info >$REDIS_PASSWORD
  " | redis-cli

  # Wrap up and start new non-daemonized redis instance, which will be the actual one running
  echo "[init.sh] Redis configuration completed! Log in using root password or user '$REDIS_USERNAME' :D"
}

# Start redis server (and add user if needed if 'REDIS_USERNAME' and 'REDIS_PASSWORD' are set)
echo "[init.sh] Starting redis server..."
if [ -n "$REDIS_USERNAME" ] && [ -n "$REDIS_PASSWORD" ]; then
  add_redis_user &
else
  echo "[init.sh] 'REDIS_USERNAME' and 'REDIS_PASSWORD' are not set. Please use 'REDIS_ROOT_PASSWORD' to log in."
fi
redis-server /usr/local/etc/redis/redis.conf --bind 0.0.0.0 --requirepass $REDIS_ROOT_PASSWORD

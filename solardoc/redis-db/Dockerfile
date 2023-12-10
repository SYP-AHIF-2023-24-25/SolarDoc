FROM redis/redis-stack:7.2.0-v5-x86_64

WORKDIR /redis

# Copy redis configuration file
COPY config/redis.conf /usr/local/etc/redis/redis.conf

# COpy ACL configuration file
COPY config/users.acl /usr/local/etc/redis/users.acl

# Copy redis init script
COPY init.sh ./init.sh
RUN chmod +x ./init.sh

CMD ["bash", "-c", "/redis/init.sh"]

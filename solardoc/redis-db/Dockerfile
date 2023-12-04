FROM redis/redis-stack:7.2.0-v5-x86_64

WORKDIR /redis

# Copy redis configuration file
COPY config/redis.conf /usr/local/etc/redis/redis.conf

COPY init.sh ./

RUN chmod +x init.sh

CMD ["bash", "-c", "./init.sh"]

FROM postgres:16-alpine AS postgresql-db

# Copy config file 'postgresql.conf' to container
COPY ./config/postgresql.conf /etc/postgresql/postgresql.conf
COPY ./scripts/ /docker-entrypoint-initdb.d/

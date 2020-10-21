# Docker

### Build

``` sh
git clean -xfd
docker build -t zzcgwu/hugo-deploy .
```

### Run

(Example)

#### Script

``` sh
docker run 
  --detach \
  --env SECRET=[webhook-secret] \
  --name hugo-deploy \
  --publish [webhook-port]:8005 \
  --restart always \
  --volume [path-to-dot-ssh-directory]/:/root/.ssh/ \
  --volume [path-to-directory-with-extra-config-toml]/:/usr/src/app/hugo-outside/ \
  --volume [path-to-http-server-static-content-directory]/:/usr/src/app/hugo-public/ \
  zzcgwu/hugo-deploy
```

#### Compose

``` yaml
version: '3.3'
services:
  hugo-deploy:
    container_name: hugo-deploy
    environment:
      - SECRET=[webhook-secret]
    image: zzcgwu/hugo-deploy
    ports:
      - '[webhook-port]:8005'
    restart: always
    volumes:
      - '[path-to-dot-ssh-directory]/:/root/.ssh/'
      - '[path-to-directory-with-extra-config-toml]/:/usr/src/app/hugo-outside/'
      - '[path-to-http-server-static-content-directory]/:/usr/src/app/hugo-public/'
```

``` sh
docker-compose up --detach
```

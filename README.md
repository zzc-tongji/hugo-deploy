# hugo-deploy

### Introduction

It is a continuous integration tool powered by [Docker](https://www.docker.com/) which is used to deploy [Hugo](https://gohugo.io/) sites.

It works with [GitHub Webhooks](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhooks). Automatically build and deploy the corresponding website when `push` event happens.

### Usage

All things between `[]` should be changed by custom values.

#### Hugo Site Source Code

Assume that:

- The [Hugo site source code](https://gohugo.io/getting-started/quick-start/) is locate at local directory `[hugo-repository]` and GitHub `https://github.com/[user]/[hugo-repository]`.
- Themes are imported as [Git Submodules](https://www.git-scm.com/book/en/v2/Git-Tools-Submodules). The default theme is located at directory `[hugo-repository]/themes/[default-theme]`.

Use the following content to create file `[hugo-repository]/script/build.sh` with the executable permission `x`.

``` sh
#!/bin/sh
set -x

# work directory
SCRIPT_PATH=`cd "$(dirname "$0")"; pwd -P`
cd $SCRIPT_PATH

cd ..
if [ -d "./themes/[default-theme]/.git/" ]; then
  git submodule update --recursive
else
  git submodule update --init --recursive
fi
if [ -f "$1" ]; then
  hugo --config config.toml,$1 --minify
else
  hugo --config config.toml --minify
fi
```

#### SSH

Create an SSH key for GitHub access. [Connecting to GitHub with SSH](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/connecting-to-github-with-ssh) provides more information.

Create directory `.ssh`, move the private key to file `.ssh/github` and change its mode as `600`.

Use the following content to create file `.ssh/config`.

```
Host github
Hostname github.com
Port 22
User git
IdentityFile ~/.ssh/github
StrictHostKeyChecking no
UserKnownHostsFile /dev/null
LogLevel ERROR
```

Make sure all things in `.ssh` are owned by user `root`.

#### Docker Compose

Use the following content to create file `docker-compose.yaml`. Change all things between `[` and `]` with your own value.

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

The priority of configurations in file `[path-to-directory-with-extra-config-toml]/extra-config.toml` is higher than which of `[hugo-repository]/config.toml`. It means same-name configurations in `[hugo-repository]/config.toml` will be ignored.

Execute the following command to run docker container.

``` sh
cd [path-to-directory-with-docker-compose-yaml] && docker-compose up --detach
```

#### GitHub Webhooks

Go to `https://github.com/[user]/[hugo-repository]/settings/hooks`.

Create a webhook and set values as following. [Webhooks](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhooks) provides more information.

| Key           | Value                                        |
| ------------- | -------------------------------------------- |
| Payload URL   | ``http://[webhook-address]:[webhook-port]/`` |
| Content typeH | `application/json`                           |
| Secret        | `[webhook-secret]`                           |

All done. The Hugo site will be built and deployed automatically when changes are pushed to the GitHub repository.

### Others

- All code files are edited by [Visual Studio Code](https://code.visualstudio.com/).
- All ".md" files are edited by [Typora](http://typora.io/).
- The style of all ".md" files is [Github Flavored Markdown](https://guides.github.com/features/mastering-markdown/#GitHub-flavored-markdown).
- There is a LF (Linux) at the end of each line.

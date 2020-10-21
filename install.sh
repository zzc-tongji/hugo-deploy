#!/bin/sh

if [ $(uname -a | grep -ci "x86_64") -gt 0 ]; then
  if [ $(cat /etc/os-release | grep -ci "debian\|ubuntu") -gt 0 ]; then
    apt-get update \
    && apt-get install -y git \
    && mv hugo /usr/local/bin/ \
    && yarn install --production
  else
    echo "[Error] unsupported linux distribution"
    exit 1
  fi
else
  echo "[Error] unsupported cpu architecture"
  exit 1
fi

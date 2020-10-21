#!/bin/sh
set -e
set -x

# work directory
SCRIPT_PATH=`cd "$(dirname "$0")"; pwd -P`
cd $SCRIPT_PATH

cd ..
SSH_URL=$1
if [ ! -d "hugo-repository/" ]; then
  git clone $SSH_URL hugo-repository/
fi
cd hugo-repository/
set +e
git pull origin master:master
RETURN=$?
set -e
if [ $RETURN -ne 0 ]; then
  cd ..
  rm -fr hugo-repository/
  git clone $SSH_URL hugo-repository/
  cd hugo-repository/
fi
sh script/build.sh ../hugo-outside/extra-config.toml
if [ ! -d "../hugo-public/" ]; then
  mkdir ../hugo-public/
fi
cd ../hugo-public/
rm -fr *
cp -r ../hugo-repository/public/* .

#!/bin/sh
VERSION=$(sed -nE "s/##.*\\[([0-9]+\\.[0-9]+\\.[0-9]+)?\].*/\\1/p" CHANGELOG.md | head -n1)
echo deploying new version of laturilla:
echo V.$VERSION
SHORTVERSION=$(echo $VERSION | sed 's/\.//g')

echo start building new version:
echo NAME: laturilla$SHORTVERSION

read -p "Press enter to continue" continue

docker build -t laturilla$SHORTVERSION .

echo " "
read -p "Press enter to shutdown old version!:" continue
docker stop `docker ps -q`
#echo remove the container if same version exists:
docker rm laturilla$SHORTVERSION

echo " "
echo "starting new new version"
docker run --name laturilla$SHORTVERSION --network="host" -d --restart unless-stopped laturilla$SHORTVERSION

docker ps
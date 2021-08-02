#!/usr/bin/env bash
# Copyright 2021 Google LLC.
# SPDX-License-Identifier: Apache-2.0

set -e

# load .env variables if they exist
if [ -f .env ]
then
  set -o allexport
  source .env
  set +o allexport
fi

cwd=`pwd`
script_folder=`cd $(dirname $0) && pwd`
version=`node $script_folder/version.js`

echo "{\"version\": \"$version\"}" > $script_folder/../manifest.version.json

required_environment_variables=("EXTENSION_ID" "CLIENT_ID" "CLIENT_SECRET" "REFRESH_TOKEN")

any_missing=0
for variable in "${required_environment_variables[@]}"
do
  val=`echo "${!variable}"`
  if [ -z "$val" ]
  then
    echo "$variable environment variable not present."
    any_missing=1
  fi
done

if [[ $any_missing -ne 0 ]]
then
  exit 1
fi

# get access token
token=`curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" 2>/dev/null`
access_token=`echo "console.log($token.access_token)" | node`

# build extension
npm run build
(cd build && zip -r extension.zip ./)

# upload and publish extension
curl -H "Authorization: Bearer ${access_token}" -H "x-goog-api-version: 2" -X PUT -T build/extension.zip "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${EXTENSION_ID}"
curl -H "Authorization: Bearer ${access_token}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST "https://www.googleapis.com/chromewebstore/v1.1/items/${EXTENSION_ID}/publish"

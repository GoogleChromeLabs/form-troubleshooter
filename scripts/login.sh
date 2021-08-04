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

required_environment_variables=("CLIENT_ID" "CLIENT_SECRET")

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

login_url="https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=$CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob"

echo "Login with $login_url"
echo "After logging in, copy/paste the code below."
read -p "Code: " code

token=`curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&code=$code&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob" 2>/dev/null`
echo $token
